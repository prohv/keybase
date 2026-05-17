import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        const { searchParams } = new URL(req.url);
        const teamId = parseInt(searchParams.get('teamId') || '');

        if (!teamId) {
            return Response.json({ error: 'teamId is required' }, { status: 400 });
        }

        const membership = await db.query.teamMembers.findFirst({
            where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, teamId)),
        });
        if (!membership) {
            return Response.json({ error: 'You are not a member of this team' }, { status: 403 });
        }

        const result = await db.query.projects.findMany({
            where: eq(projects.teamId, teamId),
            orderBy: (projects, { asc }) => [asc(projects.id)],
        });

        return Response.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('List projects error:', error);
        return Response.json({ error: 'Failed to list projects' }, { status: 500 });
    }
}
