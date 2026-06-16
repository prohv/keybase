import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { createApiKey } from '@/features/api-keys/service';
import { createApiKeySchema } from '@/features/api-keys/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const input = createApiKeySchema.parse(body);
    const newKey = await createApiKey(auth.userId, input);
    return jsonOk({
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        projectId: newKey.projectId,
        createdAt: newKey.createdAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}