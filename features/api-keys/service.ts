import { db } from '@/src/db';
import { apiKeys } from '@/src/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/encryption';
import { assertProjectMember } from '@/features/projects/policy';
import { assertTeamMember } from '@/features/teams/policy';
import { assertApiKeyAccess } from './policy';
import { AuthContext } from '@/features/auth/guards';

export async function createApiKey(
  userId: number,
  input: { name: string; key: string; projectId: number }
) {
  const project = await assertProjectMember(userId, input.projectId);

  const { encrypted, iv } = encrypt(input.key);

  const [newKey] = await db
    .insert(apiKeys)
    .values({
      name: input.name,
      encryptedKey: encrypted,
      iv,
      teamId: project.teamId,
      projectId: input.projectId,
      createdBy: userId,
    })
    .returning();

  return newKey;
}

export async function listApiKeys(
  userId: number,
  projectId: number,
  page: number = 1,
  limit: number = 4
) {
  await assertProjectMember(userId, projectId);

  const offset = (page - 1) * limit;

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.projectId, projectId),
    columns: { id: true, name: true, createdBy: true, createdAt: true },
    orderBy: [desc(apiKeys.createdAt)],
    limit,
    offset,
  });

  const totalResult = await db
    .select({ value: count() })
    .from(apiKeys)
    .where(eq(apiKeys.projectId, projectId));

  const total = Number(totalResult[0]?.value || 0);
  const hasMore = offset + keys.length < total;

  return { keys, page, hasMore, total };
}

export async function revealApiKey(auth: AuthContext, keyId: number) {
  const key = await assertApiKeyAccess(auth, keyId);
  return decrypt(key.encryptedKey, key.iv);
}

export async function deleteApiKey(auth: AuthContext, keyId: number) {
  await assertApiKeyAccess(auth, keyId);
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
}

export async function exportApiKeys(userId: number, projectId: number) {
  await assertProjectMember(userId, projectId);

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.projectId, projectId),
  });

  return keys.map((key) => ({
    name: key.name,
    value: decrypt(key.encryptedKey, key.iv),
  }));
}

export async function listTeamApiKeys(userId: number, teamId: number) {
  await assertTeamMember(userId, teamId);

  return await db.query.apiKeys.findMany({
    where: eq(apiKeys.teamId, teamId),
    columns: { id: true, name: true, createdBy: true, createdAt: true },
    orderBy: [desc(apiKeys.createdAt)],
  });
}
