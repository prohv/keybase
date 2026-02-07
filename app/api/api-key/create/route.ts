import { NextRequest } from 'next/server';
import { db } from '@/src/db';
import { apiKeys, teamMembers } from '@/src/db/schema';
import { verifyToken } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  key: z.string().min(1, 'API Key is required'),
  teamId: z.number().min(1, 'Valid Team ID is required'),
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
    const result = createApiKeySchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, key, teamId } = result.data;

    // Verify membership using core API
    const membership = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.userId, user.userId),
        eq(teamMembers.teamId, teamId)
      ))
      .limit(1);

    if (membership.length === 0) {
      return Response.json(
        { error: 'You are not a member of this team' },
        { status: 403 }
      );
    }

    // Encrypt the key
    const { encrypted, iv } = encrypt(key);

    // Insert into database
    const [newKey] = await db.insert(apiKeys).values({
      name,
      encryptedKey: encrypted,
      iv,
      teamId,
      createdBy: user.userId,
    }).returning();

    return Response.json({
      success: true,
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        teamId: newKey.teamId,
        createdAt: newKey.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create API key API error:', error);
    return Response.json(
      { error: 'Failed to securely store API key' },
      { status: 500 }
    );
  }
}