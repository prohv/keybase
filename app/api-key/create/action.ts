'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const createApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    key: z.string().min(1, 'API Key is required'),
    teamId: z.coerce.number().min(1, 'Valid Team ID is required'),
});

export async function createApiKeyAction(formData: FormData) {
    console.log('[CreateAction] Request starting...');
    const user = await getCurrentUser();

    if (!user) {
        console.log('[CreateAction] Unauthorized');
        return { error: 'Authentication required' };
    }

    const rawData = {
        name: formData.get('name'),
        teamId: formData.get('teamId'),
        keyPresent: !!formData.get('key')
    };
    console.log('[CreateAction] Raw Data:', rawData);

    const parsed = createApiKeySchema.safeParse({
        name: formData.get('name'),
        key: formData.get('key'),
        teamId: formData.get('teamId'),
    });

    if (!parsed.success) {
        console.log('[CreateAction] Validation failed:', parsed.error.issues[0].message);
        return { error: parsed.error.issues[0].message };
    }

    const { name, key, teamId } = parsed.data;

    try {
        // Verify membership using core API
        console.log(`[CreateAction] Verifying membership for user ${user.userId} in team ${teamId}`);
        const membership = await db
            .select()
            .from(teamMembers)
            .where(and(
                eq(teamMembers.userId, user.userId),
                eq(teamMembers.teamId, teamId)
            ))
            .limit(1);

        if (membership.length === 0) {
            console.log('[CreateAction] Membership check failed');
            return { error: 'You are not a member of this team' };
        }

        console.log('[CreateAction] Encrypting key...');
        const { encrypted, iv } = encrypt(key);
        console.log('[CreateAction] Encryption successful');

        console.log('[CreateAction] Inserting into database...');
        await db.insert(apiKeys).values({
            name,
            encryptedKey: encrypted,
            iv,
            teamId,
            createdBy: user.userId,
        });

        console.log('[CreateAction] Success! Revalidating /dashboard');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('[CreateAction] EXCEPTION:', error);
        return { error: error.message || 'Failed to securely store API key' };
    }
}
