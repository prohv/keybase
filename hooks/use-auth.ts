'use client';

import { useMutation } from '@tanstack/react-query';
import { loginAction } from '@/app/auth/login/action';
import { registerAction } from '@/app/auth/register/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useLoginMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await loginAction(formData);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success('Successfully logged in!');
      if (data?.redirectTo) {
        setTimeout(() => {
          router.push(data.redirectTo);
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred during login');
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await registerAction(formData);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success('Account created successfully!');
      if (data?.redirectTo) {
        setTimeout(() => {
          router.push(data.redirectTo);
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred during registration');
    },
  });
}
