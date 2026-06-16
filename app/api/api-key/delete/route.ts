import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { deleteApiKey } from '@/features/api-keys/service';
import { deleteApiKeySchema } from '@/features/api-keys/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { keyId } = deleteApiKeySchema.parse(body);
    await deleteApiKey(auth, keyId);
    return jsonOk({ message: 'API key deleted successfully' });
  } catch (error) {
    return handleRouteError(error);
  }
}