import { NextRequest } from 'next/server';
import { loginUser } from '@/features/auth/service';
import { loginSchema } from '@/features/auth/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(input);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}