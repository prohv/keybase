import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    console.log('[Middleware] auth_token present:', !!token);
    /*
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
        verifyToken(token);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    */
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*'],
};