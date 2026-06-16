'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { revealApiKey } from '@/features/api-keys/service';
import { handleActionError } from '@/shared/server/action-result';

export async function revealApiKeyAction(keyId: number) {
  try {
    const user = await requireCurrentUser();
    const plaintext = await revealApiKey(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        authType: 'jwt',
      },
      keyId
    );
    return { success: true, data: plaintext };
  } catch (error) {
    return handleActionError(error);
  }
}
