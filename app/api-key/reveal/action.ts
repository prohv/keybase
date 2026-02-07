'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';
import { eq, and } from 'drizzle-orm';

export async function revealApiKeyAction(keyId: number) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    try {
        // Fetch the key
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
            return { error: 'You do not have permission to reveal this key' };
        }

        // Decrypt the key
        const plaintext = decrypt(currentKey.encryptedKey, currentKey.iv);

        return { success: true, data: plaintext };
    } catch (error) {
        console.error('Failed to reveal API key:', error);
        return { error: 'Failed to reveal API key' };
    }
}
