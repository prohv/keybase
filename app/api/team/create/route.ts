import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { createTeam } from '@/features/teams/service';
import { createTeamSchema } from '@/features/teams/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { name } = createTeamSchema.parse(body);
    const team = await createTeam(auth.userId, name);
    return jsonOk({ team });
  } catch (error) {
    return handleRouteError(error);
  }
}