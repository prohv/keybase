import { db } from '@/src/db';
import { teams, teamMembers, apiKeys } from '@/src/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { AppError } from '@/shared/server/errors';

export async function createTeam(userId: number, name: string) {
  if (name.length < 3 || name.length > 50) {
    throw new AppError('BAD_REQUEST', 'Team name must be between 3 and 50 characters', 400);
  }

  const teamCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const newTeam = await db.transaction(async (tx) => {
    const [team] = await tx
      .insert(teams)
      .values({
        name,
        teamCode,
        createdBy: userId,
      })
      .returning();

    await tx.insert(teamMembers).values({
      userId,
      teamId: team.id,
    });

    return team;
  });

  return newTeam;
}

export async function joinTeam(userId: number, teamCode: string) {
  const code = teamCode.toUpperCase();
  
  const team = await db.query.teams.findFirst({
    where: eq(teams.teamCode, code),
  });

  if (!team) {
    throw new AppError('NOT_FOUND', 'Invalid or expired team code', 404);
  }

  const existingMember = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, team.id)
    ),
  });

  if (existingMember) {
    throw new AppError('CONFLICT', 'You are already a member of this team', 409);
  }

  await db.insert(teamMembers).values({
    userId,
    teamId: team.id,
  });

  return team;
}

export async function listUserTeams(userId: number) {
  return await db
    .select({
      id: teams.id,
      name: teams.name,
      teamCode: teams.teamCode,
      createdBy: teams.createdBy,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId));
}

export async function deleteTeams(userId: number, teamIds: number[]) {
  if (!teamIds.length) {
    throw new AppError('BAD_REQUEST', 'No teams selected', 400);
  }

  const memberships = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        inArray(teamMembers.teamId, teamIds)
      )
    );

  const authorizedIds = memberships.map((m) => m.teamId).filter(Boolean) as number[];
  if (authorizedIds.length !== teamIds.length) {
    throw new AppError('FORBIDDEN', 'You are not a member of one or more selected teams', 403);
  }

  await db.transaction(async (tx) => {
    await tx.delete(apiKeys).where(inArray(apiKeys.teamId, authorizedIds));
    await tx.delete(teamMembers).where(inArray(teamMembers.teamId, authorizedIds));
    await tx.delete(teams).where(inArray(teams.id, authorizedIds));
  });
}
