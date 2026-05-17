import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(1),
  projectId: z.number().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.authType !== 'jwt') {
      return Response.json({ error: 'Session tokens cannot create keys' }, { status: 403 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, key, projectId } = result.data;

    const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, project.teamId!)),
    });
    if (!membership) return Response.json({ error: 'Access denied' }, { status: 403 });

    const { encrypted, iv } = encrypt(key);

    const [newKey] = await db.insert(apiKeys).values({
      name,
      encryptedKey: encrypted,
      iv,
      teamId: project.teamId!,
      projectId,
      createdBy: auth.userId,
    }).returning();

    return Response.json({
      success: true,
      apiKey: { id: newKey.id, name: newKey.name, projectId: newKey.projectId, createdAt: newKey.createdAt },
    });
  } catch (error: any) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Create API key API error:', error);
    return Response.json({ error: 'Failed to securely store API key' }, { status: 500 });
  }
}