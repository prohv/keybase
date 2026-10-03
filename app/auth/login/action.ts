'use server';

import { loginUser } from '@/features/auth/service';
import { loginSchema } from '@/features/auth/schemas';
import { setSessionCookie } from '@/features/auth/session';
import { handleActionError } from '@/shared/server/action-result';
import { checkRateLimit, resetRateLimit, getActionClientIp } from '@/lib/rate-limit';
import { AppError } from '@/shared/server/errors';

export async function loginAction(formData: FormData) {
  try {
    const ip = await getActionClientIp();
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      throw new AppError(
        'RATE_LIMIT_EXCEEDED',
        `Too many login attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
        429
      );
    }

    const input = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const result = await loginUser(input);
    await setSessionCookie(result.token);

    resetRateLimit(`login:${ip}`);
    return { success: true, redirectTo: '/dashboard' };
  } catch (error) {
    return handleActionError(error);
  }
}