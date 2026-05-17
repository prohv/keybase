import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { sessionTokens } from '@/src/db/schema';
import { verifyAuth, AuthError } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
    tokenId: z.number().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.authType !== 'jwt') {
            return Response.json({ error: 'Session tokens cannot revoke tokens' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { tokenId } = parsed.data;

        await db.delete(sessionTokens).where(
            and(eq(sessionTokens.id, tokenId), eq(sessionTokens.userId, auth.userId))
        );

        return Response.json({ success: true });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Revoke token error:', error);
        return Response.json({ error: 'Failed to revoke token' }, { status: 500 });
    }
}
