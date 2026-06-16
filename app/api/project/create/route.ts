import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { createProject } from '@/features/projects/service';
import { createProjectSchema } from '@/features/projects/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { teamId, name } = createProjectSchema.parse(body);
    const project = await createProject(auth.userId, teamId, name);
    return jsonOk({ project });
  } catch (error) {
    return handleRouteError(error);
  }
}
