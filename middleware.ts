import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/team'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;

  // 1. Redirect unauthenticated users away from protected pages to login
  const isProtected = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', req.url);
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already-authenticated users away from login/register to dashboard
  const isAuthPage = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/team/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
