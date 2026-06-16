import { NextRequest } from 'next/server';
import { registerUser } from '@/features/auth/service';
import { registerSchema } from '@/features/auth/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const result = await registerUser(input);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}