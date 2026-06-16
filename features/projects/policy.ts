import { db } from '@/src/db';
import { projects, teams } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/server/errors';
import { assertTeamMember } from '@/features/teams/policy';

export async function assertProjectMember(userId: number, projectId: number) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  await assertTeamMember(userId, project.teamId);

  return project;
}

export async function assertProjectOwnerOrTeamCreator(userId: number, projectId: number) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  if (project.createdBy === userId) {
    return project;
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, project.teamId),
  });

  if (team && team.createdBy === userId) {
    return project;
  }

  throw new AppError('FORBIDDEN', 'Access denied', 403);
}
