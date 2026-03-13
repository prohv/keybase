'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchApiKeys, fetchUserTeams } from '@/lib/api/fetch';

export function useApiKeys(teamId: number) {
    return useInfiniteQuery({
        queryKey: ['api-keys', teamId],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await fetchApiKeys(teamId, pageParam, 10);
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
