'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and, desc } from 'drizzle-orm';

export async function getApiKeysAction(teamId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        // Verify user is a member of the SPECIFIC team
        const membership = await db.query.teamMembers.findFirst({
            where: and(
                eq(teamMembers.userId, user.userId),
                eq(teamMembers.teamId, teamId)
            ),
        });

        if (!membership) {
            return { error: 'You are not a member of this team' };
        }

        // Fetch keys for the team (only return safe fields)
        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.teamId, teamId as any),
            columns: {
                id: true,
                name: true,
                createdBy: true,
                createdAt: true,
            },
            orderBy: [desc(apiKeys.createdAt)],
        });

        return { success: true, data: keys };
    } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return { error: 'Failed to fetch API keys' };
    }
}
