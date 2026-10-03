import { db } from '@/src/db';
import { apiKeys } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/server/errors';
import { AuthContext } from '@/features/auth/guards';
import { assertTeamMember } from '@/features/teams/policy';

export async function assertApiKeyAccess(auth: AuthContext, keyId: number) {
  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.id, keyId),
  });

  if (!key) {
    throw new AppError('NOT_FOUND', 'API key not found', 404);
  }

  await assertTeamMember(auth.userId, key.teamId!);

  return key;
}
