'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';
import { eq, and, desc } from 'drizzle-orm';

export async function exportKeysAction(teamId: number) {
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

        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.teamId, teamId),
            orderBy: [desc(apiKeys.createdAt)],
        });

        const entries = keys.map((key) => {
            const plaintext = decrypt(key.encryptedKey, key.iv);
            const envName = key.name
                .replace(/[^a-zA-Z0-9_]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '')
                .toUpperCase();
            return { name: envName, value: plaintext };
        });

        return { success: true, data: entries };
    } catch (error) {
        console.error('Failed to export API keys:', error);
        return { error: 'Failed to export API keys' };
    }
}
