import { NextRequest } from 'next/server';
import { requireJwtAuth } from '@/features/auth/guards';
import { joinTeam } from '@/features/teams/service';
import { joinTeamSchema } from '@/features/teams/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit';
import { AppError } from '@/shared/server/errors';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireJwtAuth(req);
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`join:${auth.userId}:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        `Too many join attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
        429
      );
    }

    const body = await req.json();
    const { code } = joinTeamSchema.parse(body);
    const team = await joinTeam(auth.userId, code);

    resetRateLimit(`join:${auth.userId}:${ip}`);
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