import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthURL } from '@/lib/oauth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${origin}/api/auth/oauth/google/callback`;
  const authUrl = getGoogleAuthURL(redirectUri, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5,
    path: '/',
  });

  return response;
}
