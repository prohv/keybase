'use server';

import { listApiKeys } from '@/features/api-keys/service';
import { listUserTeams } from '@/features/teams/service';
import { getCurrentUser } from '@/features/auth/guards';

export async function fetchApiKeys(projectId: number, page: number = 1, limit: number = 4) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        const { keys, total, hasMore } = await listApiKeys(user.userId, projectId, page, limit);
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
        const userTeams = await listUserTeams(user.userId);
        return { teams: userTeams };
    } catch (error) {
        console.error('Failed to fetch user teams:', error);
        return { error: 'Failed to fetch teams' };
    }
}
