import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { sessionTokens, projects, teamMembers } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

const schema = z.object({
    projectId: z.number().min(1),
    name: z.string().min(1).max(100),
    expiryDays: z.number().min(1).max(365).nullable().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.authType !== 'jwt') {
            return Response.json({ error: 'Session tokens cannot create tokens' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { projectId, name, expiryDays } = parsed.data;

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

        const raw = 'kb_' + randomBytes(32).toString('hex');
        const hash = createHash('sha256').update(raw).digest('hex');

        const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 86400000) : null;

        const [token] = await db.insert(sessionTokens).values({
            userId: auth.userId,
            projectId,
            name,
            tokenHash: hash,
            expiresAt,
        }).returning();

        return Response.json({
            success: true,
            token: raw,
            id: token.id,
            name: token.name,
            expiresAt: token.expiresAt,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Create token error:', error);
        return Response.json({ error: 'Failed to create token' }, { status: 500 });
    }
}
