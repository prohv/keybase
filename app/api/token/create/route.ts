import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { createSessionToken } from '@/features/tokens/service';
import { createTokenSchema } from '@/features/tokens/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { projectId, name, expiryDays } = createTokenSchema.parse(body);
    const { rawToken, token } = await createSessionToken(auth.userId, projectId, name, expiryDays);
    return jsonOk({
      token: rawToken,
      id: token.id,
      name: token.name,
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
