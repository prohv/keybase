import { NextRequest } from 'next/server';
import { requireAuth } from '@/features/auth/guards';
import { listApiKeys } from '@/features/api-keys/service';
import { jsonOk, handleRouteError } from '@/shared/server/responses';
import { AppError } from '@/shared/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    let projectId: number;
    if (auth.authType === 'session_token') {
      projectId = auth.projectId!;
    } else {
      const p = parseInt(searchParams.get('projectId') || '');
      if (!p) throw new AppError('BAD_REQUEST', 'projectId is required', 400);
      projectId = p;
    }

    const { keys } = await listApiKeys(auth.userId, projectId, 1, 100);
    return jsonOk({ data: keys });
  } catch (error) {
    return handleRouteError(error);
  }
}