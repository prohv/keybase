'use server';

import { db } from '@/src/db';
import { apiKeys, projects, teamMembers } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    key: z.string().min(1, 'API Key is required'),
    projectId: z.coerce.number().min(1),
});

export async function createApiKeyAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Authentication required' };

    const parsed = schema.safeParse({
        name: formData.get('name'),
        key: formData.get('key'),
        projectId: formData.get('projectId'),
    });

    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { name, key, projectId } = parsed.data;

    try {
        const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
        if (!project) return { error: 'Project not found' };

        const membership = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.userId, user.userId), eq(teamMembers.teamId, project.teamId!)))
            .limit(1);
        if (membership.length === 0) return { error: 'Access denied' };

        const { encrypted, iv } = encrypt(key);

        await db.insert(apiKeys).values({
            name,
            encryptedKey: encrypted,
            iv,
            teamId: project.teamId!,
            projectId,
            createdBy: user.userId,
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('[CreateAction] EXCEPTION:', error);
        return { error: error.message || 'Failed to securely store API key' };
    }
}
