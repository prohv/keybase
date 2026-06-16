'use server';

import { registerUser } from '@/features/auth/service';
import { registerSchema } from '@/features/auth/schemas';
import { setSessionCookie } from '@/features/auth/session';
import { handleActionError } from '@/shared/server/action-result';

export async function registerAction(formData: FormData) {
  try {
    const input = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const result = await registerUser(input);
    await setSessionCookie(result.token);

    return { success: true, redirectTo: '/dashboard' };
  } catch (error) {
    return handleActionError(error);
  }
}