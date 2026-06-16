'use server';

import { requireCurrentUser } from '@/features/auth/guards';
import { exportApiKeys } from '@/features/api-keys/service';
import { handleActionError } from '@/shared/server/action-result';

export async function exportKeysAction(projectId: number) {
  try {
    const user = await requireCurrentUser();
    const keys = await exportApiKeys(user.userId, projectId);

    const entries = keys.map((key) => {
      const envName = key.name
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toUpperCase();
      return { name: envName, value: key.value };
    });

    return { success: true, data: entries };
  } catch (error) {
    return handleActionError(error);
  }
}
