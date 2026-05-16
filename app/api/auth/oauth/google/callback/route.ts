import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/oauth';
import { signToken } from '@/lib/jwt';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const origin = request.nextUrl.origin;

  const stateCookie = request.cookies.get('oauth_state')?.value;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  if (!state || state !== stateCookie) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_state`);
  }

  try {
    const redirectUri = `${origin}/api/auth/oauth/google/callback`;
    const { idToken } = await exchangeCodeForTokens(code, redirectUri);
    const googleUser = decodeIdToken(idToken);

    let existingUser = await db.query.users.findFirst({
      where: eq(users.oauthId, googleUser.sub),
    });

    if (!existingUser) {
      existingUser = await db.query.users.findFirst({
        where: eq(users.email, googleUser.email),
      });

      if (existingUser) {
        if (existingUser.oauthId) {
          return NextResponse.redirect(`${origin}/auth/login?error=email_linked_to_other_account`);
        }

        await db
          .update(users)
          .set({
            oauthId: googleUser.sub,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
          })
          .where(eq(users.id, existingUser.id));
      }
    }

    if (existingUser && existingUser.oauthId) {
      await db
        .update(users)
        .set({
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        })
        .where(eq(users.id, existingUser.id));
    }

    let userId: number;
    let userEmail: string;
    let userRole: 'user' | 'admin';
    let userName: string | null;
    let userAvatarUrl: string | null;

    if (existingUser) {
      userId = existingUser.id;
      userEmail = existingUser.email;
      userRole = existingUser.role;
      userName = googleUser.name;
      userAvatarUrl = googleUser.picture;
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email: googleUser.email,
          oauthId: googleUser.sub,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
        });

      userId = newUser.id;
      userEmail = newUser.email;
      userRole = newUser.role;
      userName = googleUser.name;
      userAvatarUrl = googleUser.picture;
    }

    const token = signToken({
      userId,
      email: userEmail,
      role: userRole,
      name: userName,
      avatarUrl: userAvatarUrl,
    });

    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('[OAuth Callback] Error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }
}
