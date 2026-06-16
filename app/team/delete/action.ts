'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { deleteTeams } from '@/features/teams/service';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function deleteTeamsAction(teamIds: number[]) {
  try {
    const user = await requireCurrentUser();
    await deleteTeams(user.userId, teamIds);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
