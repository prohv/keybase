// app/team/create/action.ts
'use server';

import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { z } from 'zod';
import crypto from 'crypto';

import { revalidatePath } from 'next/cache';

const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
});

export async function createTeamAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const parsed = createTeamSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name } = parsed.data;
  const teamCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const newTeam = await db.transaction(async (tx) => {
    const [team] = await tx
      .insert(teams)
      .values({
        name,
        teamCode,
        createdBy: user.userId,
      })
      .returning({
        id: teams.id,
        name: teams.name,
        teamCode: teams.teamCode,
      });

    await tx.insert(teamMembers).values({
      userId: user.userId,
      teamId: team.id,
    });

    return team;
  });

  revalidatePath('/dashboard');
  // Return success data
  return { teamCode: newTeam.teamCode };
}