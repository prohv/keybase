'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinTeamAction } from '@/app/team/join/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useJoinTeamMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await joinTeamAction(formData);
      if ('error' in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Successfully joined team: ${data.teamName}!`);
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      setTimeout(() => router.push('/dashboard'), 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred while joining the team');
    },
  });
}
