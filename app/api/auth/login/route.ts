import { NextRequest } from 'next/server';
import { loginUser } from '@/features/auth/service';
import { loginSchema } from '@/features/auth/schemas';
import { jsonOk, handleRouteError } from '@/shared/server/responses';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit';
import { AppError } from '@/shared/server/errors';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        `Too many login attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
        429
      );
    }

    const body = await req.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(input);

    resetRateLimit(`login:${ip}`);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}