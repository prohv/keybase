import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { revokeSessionToken } from '@/features/tokens/service';
import { revokeTokenSchema } from '@/features/tokens/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { tokenId } = revokeTokenSchema.parse(body);
    await revokeSessionToken(auth.userId, tokenId);
    return jsonOk();
  } catch (error) {
    return handleRouteError(error);
  }
}
