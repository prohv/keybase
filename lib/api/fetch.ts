'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers, teams } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and, desc } from 'drizzle-orm';

export async function fetchApiKeys(teamId: number, page: number = 1, limit: number = 10) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        const membership = await db.query.teamMembers.findFirst({
            where: and(
                eq(teamMembers.userId, user.userId),
                eq(teamMembers.teamId, teamId)
            ),
        });

        if (!membership) {
            return { error: 'You are not a member of this team' };
        }

        const offset = (page - 1) * limit;

        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.teamId, teamId as any),
            columns: {
                id: true,
                name: true,
                createdBy: true,
                createdAt: true,
            },
            orderBy: [desc(apiKeys.createdAt)],
            limit,
            offset,
        });

        const total = await db.select({ count: eq(apiKeys.id, apiKeys.id) }).from(apiKeys)
            .where(eq(apiKeys.teamId, teamId as any));

        const hasMore = offset + keys.length < (total[0] as any).count;

        return { 
            keys, 
            page,
            hasMore,
        };
    } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return { error: 'Failed to fetch API keys' };
    }
}

export async function fetchUserTeams() {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        const userTeams = await db
            .select({
                id: teams.id,
                name: teams.name,
                teamCode: teams.teamCode,
                createdBy: teams.createdBy,
            })
            .from(teams)
            .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
            .where(eq(teamMembers.userId, user.userId));

        return { teams: userTeams };
    } catch (error) {
        console.error('Failed to fetch user teams:', error);
        return { error: 'Failed to fetch teams' };
    }
}
