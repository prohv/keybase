'use server';

import { db } from '@/src/db';
import { teams, teamMembers, apiKeys } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteTeamsAction(teamIds: number[]) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    if (!teamIds.length) {
        return { error: 'No teams selected' };
    }

    try {
        const memberships = await db
            .select()
            .from(teamMembers)
            .where(
                and(
                    eq(teamMembers.userId, user.userId),
                    inArray(teamMembers.teamId, teamIds)
                )
            );

        const authorizedIds = memberships.map((m) => m.teamId).filter(Boolean) as number[];
        if (authorizedIds.length !== teamIds.length) {
            return { error: 'You are not a member of one or more selected teams' };
        }

        await db.delete(apiKeys).where(inArray(apiKeys.teamId, authorizedIds as any));
        await db.delete(teamMembers).where(inArray(teamMembers.teamId, authorizedIds as any));
        await db.delete(teams).where(inArray(teams.id, authorizedIds as any));

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete teams:', error);
        return { error: 'Failed to delete teams' };
    }
}
