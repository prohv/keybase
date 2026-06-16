import { NextRequest } from 'next/server';
import { requireAuth } from '@/features/auth/guards';
import { revealApiKey } from '@/features/api-keys/service';
import { revealApiKeySchema } from '@/features/api-keys/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json();
    const { keyId } = revealApiKeySchema.parse(body);
    const plaintext = await revealApiKey(auth, keyId);
    return jsonOk({ data: plaintext });
  } catch (error) {
    return handleRouteError(error);
  }
}