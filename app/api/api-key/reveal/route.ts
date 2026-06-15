import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);

    const body = await req.json();
    const keyId = body.keyId;
    if (!keyId || typeof keyId !== 'number') {
      return Response.json({ error: 'Valid keyId is required' }, { status: 400 });
    }

    const currentKey = await db.query.apiKeys.findFirst({ where: eq(apiKeys.id, keyId) });
    if (!currentKey) return Response.json({ error: 'API key not found' }, { status: 404 });

    let teamId: number;
    if (auth.authType === 'session_token') {
      const project = await db.query.projects.findFirst({ where: eq(projects.id, auth.projectId!) });
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
      teamId = project.teamId!;
    } else {
      teamId = currentKey.teamId!;
    }

    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, teamId)),
    });
    if (!membership) return Response.json({ error: 'Access denied' }, { status: 403 });

    const plaintext = decrypt(currentKey.encryptedKey, currentKey.iv);

    return Response.json({ success: true, data: plaintext });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Reveal API key API error:', error);
    return Response.json({ error: 'Failed to reveal API key' }, { status: 500 });
  }
}