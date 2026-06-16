'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { createProject } from '@/features/projects/service';
import { createProjectSchema } from '@/features/projects/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(input: { teamId: number; name: string }) {
  try {
    const user = await requireCurrentUser();
    const { teamId, name } = createProjectSchema.parse(input);
    const project = await createProject(user.userId, teamId, name);

    revalidatePath('/dashboard');
    return { success: true, project };
  } catch (error) {
    return handleActionError(error);
  }
}
