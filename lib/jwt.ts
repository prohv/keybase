import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import { db } from '@/src/db';
import { sessionTokens, users } from '@/src/db/schema';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { NextRequest } from 'next/server';

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error('JWT_SECRET missing');

export interface TokenPayload {
    userId: number;
    email: string;
    role: 'user' | 'admin';
    name?: string | null;
    avatarUrl?: string | null;
}

export interface AuthContext {
    userId: number;
    email: string;
    role: 'user' | 'admin';
    authType: 'jwt' | 'session_token';
    projectId?: number;
    name?: string | null;
    avatarUrl?: string | null;
}

export class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, SECRET, {
        expiresIn: '7d',
    });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, SECRET) as TokenPayload;
}

function hashToken(input: string): string {
    return createHash('sha256').update(input).digest('hex');
}

export async function verifyAuth(req: NextRequest | Request): Promise<AuthContext> {
    const header = req.headers.get('Authorization');

    let raw: string | null = null;

    if (header?.startsWith('Bearer ')) {
        raw = header.substring(7);
    }

    // Fallback: try reading JWT from auth_token cookie (browser requests)
    if (!raw && 'cookies' in req) {
        const nextReq = req as NextRequest;
        raw = nextReq.cookies.get('auth_token')?.value ?? null;
    }

    if (!raw) {
        throw new AuthError('Missing or invalid Authorization header', 401);
    }

    if (raw.startsWith('kb_')) {
        const hash = hashToken(raw);
        const st = await db.query.sessionTokens.findFirst({
            where: and(
                eq(sessionTokens.tokenHash, hash),
                or(isNull(sessionTokens.expiresAt), gt(sessionTokens.expiresAt, new Date()))
            ),
        });
        if (!st) throw new AuthError('Invalid or expired session token', 401);

        await db.update(sessionTokens).set({ lastUsedAt: new Date() }).where(eq(sessionTokens.id, st.id));

        const user = await db.query.users.findFirst({ where: eq(users.id, st.userId) });
        if (!user) throw new AuthError('Token user not found', 401);

        return {
            userId: st.userId,
            email: user.email,
            role: user.role,
            authType: 'session_token',
            projectId: st.projectId!,
        };
    }

    const payload = verifyToken(raw);
    return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        authType: 'jwt',
        name: payload.name,
        avatarUrl: payload.avatarUrl,
    };
}

// server action helper
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        return verifyToken(token);
    } catch {
        return null;
    }
}

export async function getCurrentUser() {
    return await getSession();
}