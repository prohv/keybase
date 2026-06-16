'use server';

import { loginUser } from '@/features/auth/service';
import { loginSchema } from '@/features/auth/schemas';
import { setSessionCookie } from '@/features/auth/session';
import { handleActionError } from '@/shared/server/action-result';

export async function loginAction(formData: FormData) {
  try {
    const input = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const result = await loginUser(input);
    await setSessionCookie(result.token);

    return { success: true, redirectTo: '/dashboard' };
  } catch (error) {
    return handleActionError(error);
  }
}