import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.authType !== 'jwt') {
      return Response.json({ error: 'Session tokens cannot delete keys' }, { status: 403 });
    }

    const body = await req.json();
    const keyId = body.keyId;
    if (!keyId || typeof keyId !== 'number') {
      return Response.json({ error: 'Valid keyId is required' }, { status: 400 });
    }

    const currentKey = await db.query.apiKeys.findFirst({ where: eq(apiKeys.id, keyId) });
    if (!currentKey) return Response.json({ error: 'API key not found' }, { status: 404 });

    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, currentKey.teamId!)),
    });
    if (!membership) return Response.json({ error: 'Access denied' }, { status: 403 });

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    return Response.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Delete API key API error:', error);
    return Response.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}