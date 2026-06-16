'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { createSessionToken } from '@/features/tokens/service';
import { createTokenSchema } from '@/features/tokens/schemas';
import { handleActionError } from '@/shared/server/action-result';

export async function createTokenAction(input: { projectId: number; name: string; expiryDays?: number | null }) {
  try {
    const user = await requireCurrentUser();
    const validated = createTokenSchema.parse(input);
    const { rawToken, token } = await createSessionToken(
      user.userId,
      validated.projectId,
      validated.name,
      validated.expiryDays ?? undefined
    );

    return {
      success: true,
      token: rawToken,
      id: token.id,
      name: token.name,
      expiresAt: token.expiresAt,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
