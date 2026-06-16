'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { createTeam } from '@/features/teams/service';
import { createTeamSchema } from '@/features/teams/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function createTeamAction(formData: FormData) {
  try {
    const user = await requireCurrentUser();
    const { name } = createTeamSchema.parse({
      name: formData.get('name'),
    });

    const team = await createTeam(user.userId, name);

    revalidatePath('/dashboard');
    return { teamCode: team.teamCode };
  } catch (error) {
    return handleActionError(error);
  }
}