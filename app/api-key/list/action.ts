'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { listTeamApiKeys } from '@/features/api-keys/service';
import { handleActionError } from '@/shared/server/action-result';

export async function getApiKeysAction(teamId: number) {
  try {
    const user = await requireCurrentUser();
    const keys = await listTeamApiKeys(user.userId, teamId);
    return { success: true, data: keys };
  } catch (error) {
    return handleActionError(error);
  }
}
