import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const { searchParams } = new URL(req.url);

    let projectId: number;
    if (auth.authType === 'session_token') {
      projectId = auth.projectId!;
    } else {
      const p = parseInt(searchParams.get('projectId') || '');
      if (!p) return Response.json({ error: 'projectId is required' }, { status: 400 });
      projectId = p;
    }

    const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, project.teamId!)),
    });
    if (!membership) return Response.json({ error: 'Access denied' }, { status: 403 });

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.projectId, projectId),
      columns: { id: true, name: true, createdBy: true, createdAt: true },
      orderBy: [desc(apiKeys.createdAt)],
    });

    return Response.json({ success: true, data: keys });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('List API keys API error:', error);
    return Response.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}