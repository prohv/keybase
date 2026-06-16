'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { createApiKey } from '@/features/api-keys/service';
import { createApiKeySchema } from '@/features/api-keys/schemas';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function createApiKeyAction(formData: FormData) {
  try {
    const user = await requireCurrentUser();
    const input = createApiKeySchema.parse({
      name: formData.get('name'),
      key: formData.get('key'),
      projectId: Number(formData.get('projectId')),
    });

    await createApiKey(user.userId, input);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
