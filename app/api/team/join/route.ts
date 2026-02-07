import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const joinTeamSchema = z.object({
  code: z.string().min(4).max(12).toUpperCase(),
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
    const result = joinTeamSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const { code } = result.data;

    // Find team by code
    const team = await db.query.teams.findFirst({
      where: eq(teams.teamCode, code),
    });

    if (!team) {
      return Response.json(
        { error: 'Invalid or expired team code' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.userId),
        eq(teamMembers.teamId, team.id)
      ),
    });

    if (existingMember) {
      return Response.json(
        { error: 'You are already a member of this team' },
        { status: 409 }
      );
    }

    // Add user to team
    await db.insert(teamMembers).values({
      userId: user.userId,
      teamId: team.id,
    });

    return Response.json({
      success: true,
      message: 'Successfully joined team',
      team: {
        id: team.id,
        name: team.name,
      },
    });
  } catch (error: any) {
    console.error('Join team API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}