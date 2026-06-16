import { db } from '@/src/db';
import { apiKeys } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/server/errors';
import { AuthContext } from '@/features/auth/guards';
import { assertTeamMember } from '@/features/teams/policy';
import { assertProjectMember } from '@/features/projects/policy';

export async function assertApiKeyAccess(auth: AuthContext, keyId: number) {
  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.id, keyId),
  });

  if (!key) {
    throw new AppError('NOT_FOUND', 'API key not found', 404);
  }

  let teamId: number;
  if (auth.authType === 'session_token') {
    const project = await assertProjectMember(auth.userId, auth.projectId!);
    teamId = project.teamId;
  } else {
    teamId = key.teamId!;
  }

  await assertTeamMember(auth.userId, teamId);

  return key;
}
