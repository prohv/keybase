'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { joinTeam } from '@/features/teams/service';
import { joinTeamSchema } from '@/features/teams/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function joinTeamAction(formData: FormData) {
  try {
    const user = await requireCurrentUser();
    const { code } = joinTeamSchema.parse({
      code: formData.get('code'),
    });

    const team = await joinTeam(user.userId, code);

    revalidatePath('/dashboard');
    return { success: true, teamName: team.name };
  } catch (error) {
    return handleActionError(error);
  }
}