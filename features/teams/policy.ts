import { db } from '@/src/db';
import { teamMembers } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/shared/server/errors';

export async function assertTeamMember(userId: number, teamId: number) {
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
  });

  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied', 403);
  }

  return membership;
}
