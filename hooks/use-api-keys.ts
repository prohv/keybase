'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchApiKeys, fetchUserTeams } from '@/lib/api/fetch';
import { createApiKeyAction } from '@/app/api-key/create/action';
import { deleteApiKeyAction } from '@/app/api-key/delete/action';
import { exportKeysAction } from '@/app/api-key/export/action';

export function useApiKeys(projectId: number) {
    return useInfiniteQuery({
        queryKey: ['api-keys', projectId],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await fetchApiKeys(projectId, pageParam, 4);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!projectId,
        staleTime: 1000 * 30,
    });
}

export function useUserTeams() {
    return useQuery({
        queryKey: ['user-teams'],
        queryFn: async () => {
            const result = await fetchUserTeams();
            if ('error' in result) throw new Error(result.error);
            return result.teams;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateApiKeyMutation(projectId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            formData.set('projectId', String(projectId));
            const result = await createApiKeyAction(formData);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            toast.success('API key created successfully');
            queryClient.invalidateQueries({ queryKey: ['api-keys', projectId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeleteApiKeyMutation(projectId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (keyId: number) => {
            const result = await deleteApiKeyAction(keyId);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            toast.success('API key deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['api-keys', projectId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useExportKeysMutation() {
    return useMutation({
        mutationFn: async (projectId: number) => {
            const result = await exportKeysAction(projectId);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
