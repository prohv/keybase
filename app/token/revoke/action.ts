'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { revokeSessionToken } from '@/features/tokens/service';
import { revokeTokenSchema } from '@/features/tokens/schemas';
import { handleActionError } from '@/shared/server/action-result';

export async function revokeTokenAction(tokenId: number) {
  try {
    const user = await requireCurrentUser();
    const validated = revokeTokenSchema.parse({ tokenId });
    await revokeSessionToken(user.userId, validated.tokenId);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
