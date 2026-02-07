'use server';

import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const createApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    key: z.string().min(1, 'API Key is required'),
});

export async function createApiKeyAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Authentication required' };
    }

    const parsed = createApiKeySchema.safeParse({
        name: formData.get('name'),
        key: formData.get('key'),
    });

    if (!parsed.success) {
        return { error: parsed.error.errors[0].message };
    }

    const { name, key } = parsed.data;

    try {
        // Find the first team the user is a member of
        const membership = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.userId, user.userId),
        });

        if (!membership) {
            return { error: 'You are not a member of any team' };
        }

        const { encrypted, iv } = encrypt(key);

        await db.insert(apiKeys).values({
            name,
            encryptedKey: encrypted,
            iv,
            teamId: membership.teamId,
            createdBy: user.userId,
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to create API key:', error);
        return { error: 'Failed to create API key' };
    }
}
