'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchApiKeys, fetchUserTeams } from '@/lib/api/fetch';
import { createApiKeyAction } from '@/app/api-key/create/action';
import { deleteApiKeyAction } from '@/app/api-key/delete/action';
import { exportKeysAction } from '@/app/api-key/export/action';

export function useApiKeys(teamId: number) {
    return useInfiniteQuery({
        queryKey: ['api-keys', teamId],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await fetchApiKeys(teamId, pageParam, 4);
            if (result.error) throw new Error(result.error);
            return result;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!teamId,
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useUserTeams() {
    return useQuery({
        queryKey: ['user-teams'],
        queryFn: async () => {
            const result = await fetchUserTeams();
            if (result.error) throw new Error(result.error);
            return result.teams;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateApiKeyMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createApiKeyAction(formData);
            if (result.error) throw new Error(result.error);
            return result;
        },
        onSuccess: (_, variables) => {
            const teamId = parseInt(variables.get('teamId') as string);
            toast.success('API key created successfully');
            queryClient.invalidateQueries({ queryKey: ['api-keys', teamId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeleteApiKeyMutation(teamId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (keyId: number) => {
            const result = await deleteApiKeyAction(keyId);
            if (result.error) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            toast.success('API key deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['api-keys', teamId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useExportKeysMutation() {
    return useMutation({
        mutationFn: async (teamId: number) => {
            const result = await exportKeysAction(teamId);
            if (result.error) throw new Error(result.error);
            return result;
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
