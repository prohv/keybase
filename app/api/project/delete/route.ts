import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { deleteProject } from '@/features/projects/service';
import { deleteProjectSchema } from '@/features/projects/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { projectId } = deleteProjectSchema.parse(body);
    await deleteProject(auth.userId, projectId);
    return jsonOk();
  } catch (error) {
    return handleRouteError(error);
  }
}
