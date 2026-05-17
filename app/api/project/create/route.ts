import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
    teamId: z.number().min(1),
    name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.authType !== 'jwt') {
            return Response.json({ error: 'Session tokens cannot create projects' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { teamId, name } = parsed.data;

        const membership = await db.query.teamMembers.findFirst({
            where: and(eq(teamMembers.userId, auth.userId), eq(teamMembers.teamId, teamId)),
        });
        if (!membership) {
            return Response.json({ error: 'You are not a member of this team' }, { status: 403 });
        }

        const [project] = await db.insert(projects).values({
            name,
            teamId,
            createdBy: auth.userId,
        }).returning();

        return Response.json({ success: true, project });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Create project error:', error);
        return Response.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
