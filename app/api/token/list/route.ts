import { NextRequest } from 'next/server';
import { requireAuth } from '@/features/auth/guards';
import { listSessionTokens } from '@/features/tokens/service';
import { jsonOk, handleRouteError } from '@/shared/server/responses';
import { AppError } from '@/shared/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const projectId = parseInt(searchParams.get('projectId') || '');

    if (!projectId) {
      throw new AppError('BAD_REQUEST', 'projectId is required', 400);
    }

    const tokens = await listSessionTokens(auth.userId, projectId);
    return jsonOk({ data: tokens });
  } catch (error) {
    return handleRouteError(error);
  }
}
