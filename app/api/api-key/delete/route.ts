import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export async function DELETE(req: NextRequest) {
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
    const keyId = body.keyId;

    if (!keyId || typeof keyId !== 'number') {
      return Response.json(
        { error: 'Valid keyId is required' },
        { status: 400 }
      );
    }

    // Fetch the key to check ownership
    const currentKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!currentKey) {
      return Response.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the team that owns this key
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.userId),
        eq(teamMembers.teamId, currentKey.teamId!)
      ),
    });

    if (!membership) {
      return Response.json(
        { error: 'You do not have permission to delete this key' },
        { status: 403 }
      );
    }

    // Delete the key
    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    return Response.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete API key API error:', error);
    return Response.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}