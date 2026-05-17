'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers, teams, projects } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and, desc, count } from 'drizzle-orm';

export async function fetchApiKeys(projectId: number, page: number = 1, limit: number = 4) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
        if (!project) return { error: 'Project not found' };

        const membership = await db.query.teamMembers.findFirst({
            where: and(eq(teamMembers.userId, user.userId), eq(teamMembers.teamId, project.teamId!)),
        });
        if (!membership) return { error: 'Access denied' };

        const offset = (page - 1) * limit;

        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.projectId, projectId as any),
            columns: { id: true, name: true, createdBy: true, createdAt: true },
            orderBy: [desc(apiKeys.createdAt)],
            limit,
            offset,
        });

        const totalResult = await db
            .select({ value: count() })
            .from(apiKeys)
            .where(eq(apiKeys.projectId, projectId as any));

        const total = Number(totalResult[0].value);
        const hasMore = offset + keys.length < total;

        return { keys, page, hasMore, total };
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
