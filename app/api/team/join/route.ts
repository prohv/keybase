import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { joinTeam } from '@/features/teams/service';
import { joinTeamSchema } from '@/features/teams/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const body = await req.json();
    const { code } = joinTeamSchema.parse(body);
    const team = await joinTeam(auth.userId, code);
    return jsonOk({
      message: 'Successfully joined team',
      team: {
        id: team.id,
        name: team.name,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}