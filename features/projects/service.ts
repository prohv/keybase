import { db } from '@/src/db';
import { projects } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { assertTeamMember } from '@/features/teams/policy';
import { assertProjectOwnerOrTeamCreator } from './policy';

export async function createProject(userId: number, teamId: number, name: string) {
  await assertTeamMember(userId, teamId);

  const [project] = await db
    .insert(projects)
    .values({
      name,
      teamId,
      createdBy: userId,
    })
    .returning();

  return project;
}

export async function listProjects(userId: number, teamId: number) {
  await assertTeamMember(userId, teamId);

  return await db.query.projects.findMany({
    where: eq(projects.teamId, teamId),
  });
}

export async function deleteProject(userId: number, projectId: number) {
  await assertProjectOwnerOrTeamCreator(userId, projectId);
  await db.delete(projects).where(eq(projects.id, projectId));
}
