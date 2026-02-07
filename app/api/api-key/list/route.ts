import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const listApiKeysSchema = z.object({
  teamId: z.number().min(1, 'Valid Team ID is required'),
});

export async function GET(req: NextRequest) {
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

    // Get teamId from query params
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('teamId');
    
    if (!teamIdParam) {
      return Response.json(
        { error: 'teamId parameter is required' },
        { status: 400 }
      );
    }

    const teamId = parseInt(teamIdParam);
    if (isNaN(teamId)) {
      return Response.json(
        { error: 'Invalid teamId parameter' },
        { status: 400 }
      );
    }

    // Verify user is a member of the SPECIFIC team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.userId),
        eq(teamMembers.teamId, teamId)
      ),
    });

    if (!membership) {
      return Response.json(
        { error: 'You are not a member of this team' },
        { status: 403 }
      );
    }

    // Fetch keys for the team (only return safe fields)
    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.teamId, teamId),
      columns: {
        id: true,
        name: true,
        createdBy: true,
        createdAt: true,
      },
      orderBy: [desc(apiKeys.createdAt)],
    });

    return Response.json({
      success: true,
      data: keys,
    });
  } catch (error: any) {
    console.error('List API keys API error:', error);
    return Response.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}