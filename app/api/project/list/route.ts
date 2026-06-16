import { NextRequest } from 'next/server';
import { requireAuth } from '@/features/auth/guards';
import { listProjects } from '@/features/projects/service';
import { jsonOk, handleRouteError } from '@/shared/server/responses';
import { AppError } from '@/shared/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const teamId = parseInt(searchParams.get('teamId') || '');

    if (!teamId) {
      throw new AppError('BAD_REQUEST', 'teamId is required', 400);
    }

    const projects = await listProjects(auth.userId, teamId);
    return jsonOk({ data: projects });
  } catch (error) {
    return handleRouteError(error);
  }
}
