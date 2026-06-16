import { db } from '@/src/db';
import { sessionTokens } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { assertProjectMember } from '@/features/projects/policy';
import { AppError } from '@/shared/server/errors';

export async function createSessionToken(
  userId: number,
  projectId: number,
  name: string,
  expiryDays?: number | null
) {
  await assertProjectMember(userId, projectId);

  const rawToken = 'kb_' + randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 86400000) : null;

  const [token] = await db
    .insert(sessionTokens)
    .values({
      userId,
      projectId,
      name,
      tokenHash: hash,
      expiresAt,
    })
    .returning();

  return { rawToken, token };
}

export async function listSessionTokens(userId: number, projectId: number) {
  await assertProjectMember(userId, projectId);

  return await db.query.sessionTokens.findMany({
    where: eq(sessionTokens.projectId, projectId),
  });
}

export async function revokeSessionToken(userId: number, tokenId: number) {
  const token = await db.query.sessionTokens.findFirst({
    where: eq(sessionTokens.id, tokenId),
  });

  if (!token) {
    throw new AppError('NOT_FOUND', 'Session token not found', 404);
  }

  await assertProjectMember(userId, token.projectId);

  await db.delete(sessionTokens).where(eq(sessionTokens.id, tokenId));
}
