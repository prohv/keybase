'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteApiKeyAction(keyId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        // Fetch the key to check ownership/team
        const currentKey = await db.query.apiKeys.findFirst({
            where: eq(apiKeys.id, keyId),
        });

        if (!currentKey) {
            return { error: 'API key not found' };
        }

        // Verify user is a member of the team that owns this key
        const membership = await db.query.teamMembers.findFirst({
            where: and(
                eq(teamMembers.userId, user.userId),
                eq(teamMembers.teamId, currentKey.teamId!)
            ),
        });

        if (!membership) {
            return { error: 'You do not have permission to delete this key' };
        }

        // Delete the key
        await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete API key:', error);
        return { error: 'Failed to delete API key' };
    }
}
