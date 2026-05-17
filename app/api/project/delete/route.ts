import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { projects, teams } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
    projectId: z.number().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.authType !== 'jwt') {
            return Response.json({ error: 'Session tokens cannot delete projects' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { projectId } = parsed.data;

        const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        const team = await db.query.teams.findFirst({ where: eq(teams.id, project.teamId!) });
        if (!team || team.createdBy !== auth.userId) {
            return Response.json({ error: 'Only the team creator can delete projects' }, { status: 403 });
        }

        await db.delete(projects).where(eq(projects.id, projectId));

        return Response.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Delete project error:', error);
        return Response.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
