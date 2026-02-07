import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { verifyToken } from '@/lib/jwt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    let user;
    try {
      user = verifyToken(token);
    } catch (error) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = createTeamSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name } = result.data;
    const teamCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newTeam = await db.transaction(async (tx) => {
      const [team] = await tx
        .insert(teams)
        .values({
          name,
          teamCode,
          createdBy: user.userId,
        })
        .returning({
          id: teams.id,
          name: teams.name,
          teamCode: teams.teamCode,
          createdAt: teams.createdAt,
        });

      await tx.insert(teamMembers).values({
        userId: user.userId,
        teamId: team.id,
      });

      return team;
    });

    return Response.json({
      success: true,
      team: newTeam,
    });
  } catch (error: any) {
    console.error('Create team API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}