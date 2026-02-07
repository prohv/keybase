'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, desc } from 'drizzle-orm';

export async function getApiKeysAction() {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        // Find the first team the user is a member of
        const membership = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.userId, user.userId),
        });

        if (!membership) {
            return { error: 'You are not a member of any team' };
        }

        // Fetch keys for the team (only return safe fields)
        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.teamId, membership.teamId),
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
