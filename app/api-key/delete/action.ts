'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { deleteApiKey } from '@/features/api-keys/service';
import { handleActionError } from '@/shared/server/action-result';
import { revalidatePath } from 'next/cache';

export async function deleteApiKeyAction(keyId: number) {
  try {
    const user = await requireCurrentUser();
    await deleteApiKey(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        authType: 'jwt',
      },
      keyId
    );
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
