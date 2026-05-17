import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { sessionTokens, projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        const { searchParams } = new URL(req.url);
        const projectId = parseInt(searchParams.get('projectId') || '');

        if (!projectId) {
            return Response.json({ error: 'projectId is required' }, { status: 400 });
        }

        const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        const membership = await db.query.teamMembers.findFirst({
            where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, project.teamId!)),
        });
        if (!membership) {
            return Response.json({ error: 'You are not a member of this team' }, { status: 403 });
        }

        const result = await db.query.sessionTokens.findMany({
            where: and(eq(sessionTokens.userId, auth.userId), eq(sessionTokens.projectId, projectId)),
            columns: {
                id: true,
                name: true,
                scopes: true,
                expiresAt: true,
                lastUsedAt: true,
                createdAt: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });

        return Response.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('List tokens error:', error);
        return Response.json({ error: 'Failed to list tokens' }, { status: 500 });
    }
}
