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

//server action 
export async function getSession(){
    const token = (await cookies()).get('auth_token')?.value;
    if(!token) return null;
    try {
        return verifyToken(token);
    } catch {
        return null;
    }
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return session;
}