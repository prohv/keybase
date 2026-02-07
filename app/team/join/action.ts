'use server';

import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const joinTeamSchema = z.object({
  code: z.string().min(4).max(12).toUpperCase(),
});

export async function joinTeamAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'You must be logged in to join a team' };
  }

  const parsed = joinTeamSchema.safeParse({
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return { error: 'Invalid code format' };
  }

  const { code } = parsed.data;

  // Find team by code
  const team = await db.query.teams.findFirst({
    where: eq(teams.teamCode, code),
  });

  if (!team) {
    return { error: 'Invalid or expired team code' };
  }

  // Check if user is already a member
  const existingMember = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, user.userId),
      eq(teamMembers.teamId, team.id)
    ),
  });

  if (existingMember) {
    return { error: 'You are already a member of this team' };
  }

  // Add user to team
  await db.insert(teamMembers).values({
    userId: user.userId,
    teamId: team.id,
  });

  revalidatePath('/dashboard');
  return { success: true, teamName: team.name };
}