import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest){
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
        verifyToken(token);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};