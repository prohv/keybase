import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error('JWT_SECRET missing');

export interface TokenPayload {
    userId: number;
    email: string;
    role: 'user' | 'admin';
}

export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, SECRET, {
        expiresIn: '7d',
    });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, SECRET) as TokenPayload;
}

// server action helper
export async function getSession() {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('[Auth] Cookies visible on server during getSession:', allCookies.map(c => c.name));

    const token = cookieStore.get('auth_token')?.value;
    console.log('[Auth] auth_token found:', !!token);

    if (!token) {
        return null;
    }

    try {
        const payload = verifyToken(token);
        console.log('[Auth] Token verified for:', payload.email);
        return payload;
    } catch (err) {
        console.error('[Auth] Token verification failed:', err);
        return null;
    }
}

export async function getCurrentUser() {
    return await getSession();
}