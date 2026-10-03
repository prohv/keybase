import { NextRequest } from 'next/server';
import { AppError } from '@/shared/server/errors';
import { verifyToken, TokenPayload } from './token';
import { getSessionCookie } from './session';

export interface AuthContext {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  authType: 'jwt';
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

export async function verifyAuth(req: NextRequest | Request): Promise<AuthContext> {
  const header = req.headers.get('Authorization');
  let raw: string | null = null;

  if (header?.startsWith('Bearer ')) {
    raw = header.substring(7);
  }

  if (!raw && 'cookies' in req) {
    const nextReq = req as NextRequest;
    raw = nextReq.cookies.get('auth_token')?.value ?? null;
  }

  if (!raw) {
    throw new AuthError('Missing or invalid Authorization header', 401);
  }

  try {
    const payload = verifyToken(raw);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      authType: 'jwt',
      name: payload.name,
      avatarUrl: payload.avatarUrl,
    };
  } catch {
    throw new AuthError('Invalid or expired token', 401);
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const token = await getSessionCookie();
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  return getSession();
}

export async function requireCurrentUser(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
  return user;
}

export async function requireAuth(req: NextRequest | Request): Promise<AuthContext> {
  try {
    return await verifyAuth(req);
  } catch (err) {
    if (err instanceof AuthError) {
      throw new AppError('UNAUTHORIZED', err.message, err.status);
    }
    throw err;
  }
}

export async function requireJwtAuth(req: NextRequest | Request): Promise<AuthContext> {
  const auth = await requireAuth(req);
  if (auth.authType !== 'jwt') {
    throw new AppError('FORBIDDEN', 'Access denied', 403);
  }
  return auth;
}
