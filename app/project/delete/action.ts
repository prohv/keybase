'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { deleteProject } from '@/features/projects/service';
import { deleteProjectSchema } from '@/features/projects/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function deleteProjectAction(projectId: number) {
  try {
    const user = await requireCurrentUser();
    const validated = deleteProjectSchema.parse({ projectId });
    await deleteProject(user.userId, validated.projectId);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
