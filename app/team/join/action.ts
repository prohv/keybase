'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { joinTeam } from '@/features/teams/service';
import { joinTeamSchema } from '@/features/teams/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { checkRateLimit, resetRateLimit, getActionClientIp } from '@/lib/rate-limit';
import { AppError } from '@/shared/server/errors';
import { revalidatePath } from 'next/cache';

export async function joinTeamAction(formData: FormData) {
  try {
    const user = await requireCurrentUser();
    const ip = await getActionClientIp();
    const rateCheck = checkRateLimit(`join:${user.userId}:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        `Too many join attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
        429
      );
    }

    const { code } = joinTeamSchema.parse({
      code: formData.get('code'),
    });

    const team = await joinTeam(user.userId, code);

    resetRateLimit(`join:${user.userId}:${ip}`);
    revalidatePath('/dashboard');
    return { success: true, teamName: team.name };
  } catch (error) {
    return handleActionError(error);
  }
}