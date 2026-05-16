const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function getClientId(): string {
  const id = process.env.OAUTH_CLIENT_ID;
  if (!id) throw new Error('OAUTH_CLIENT_ID not set');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.OAUTH_CLIENT_SECRET;
  if (!secret) throw new Error('OAUTH_CLIENT_SECRET not set');
  return secret;
}

export function getGoogleAuthURL(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUser {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ accessToken: string; idToken: string }> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const data: GoogleTokenResponse = await response.json();
  return { accessToken: data.access_token, idToken: data.id_token };
}

export function decodeIdToken(idToken: string): GoogleUser {
  const payloadBase64 = idToken.split('.')[1];
  const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
  const payload = JSON.parse(payloadJson);

  if (!payload.sub || !payload.email) {
    throw new Error('Invalid id_token: missing sub or email');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified ?? false,
    name: payload.name ?? payload.email.split('@')[0],
    picture: payload.picture ?? '',
  };
}
