'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/lib/errors';
import type { UserLite } from '@/lib/types';
import { MINUTES } from '@/lib/constants'
import { createClient } from '@/lib/client/supabase/client';
import { useEffect, useState } from 'react';

type UseAllUsersOpts = {
  q?: string;
  enabled?: boolean;
};

type UsersPaged = { items: UserLite[]; nextPage: number | null };

function isUsersPaged(x: unknown): x is UsersPaged {
  return (
    typeof x === 'object' &&
    x !== null &&
    Array.isArray((x as { items?: unknown }).items)
  );
}

export function useFetchUsers(opts: UseAllUsersOpts = {}) {
  const { q, enabled = true } = opts;

  return useQuery<UserLite[], ApiError>({
    queryKey: ['all-users', { q: q ?? '' }],
    enabled,
    staleTime: MINUTES.FIVE,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q && q.trim()) params.set('q', q.trim());

      const r = await fetch(`/api/users${params.toString() ? `?${params}` : ''}`, {
        cache: 'no-store',
      });
      if (!r.ok) {
        const err = (await r.json()) as unknown;
        throw err as ApiError;
      }

      const json = (await r.json()) as unknown;

      const items: UserLite[] = Array.isArray(json)
        ? json as UserLite[]
        : isUsersPaged(json)
          ? (json.items as UserLite[])
          : [];

      const map = new Map<string, UserLite>();
      for (const u of items) {
        if (u?.userId) map.set(u.userId, u);
      }
      return Array.from(map.values());
    },
  });
}

export function useFetchUser(userId: string) {
  return useQuery<UserLite, ApiError>({
    queryKey: ['users', userId], 
    queryFn: async () => {
      const r = await fetch(`/api/users/${userId}`);
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as UserLite;
    },
    enabled: !!userId,
    staleTime: MINUTES.THIRTY, 
    refetchOnWindowFocus: false,
  });
}

export function useFetchCurrentUser() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    getUser();
  }, []);

  // Use useFetchUser to fetch Profile data from the obtained ID.
  const query = useFetchUser(currentUserId ?? '');

  return {
    ...query,
    data: currentUserId ? query.data : null, // Return null if no ID exists.
    isLoading: isLoadingAuth || query.isLoading, // Total Loading Status
    isAuthenticated: !!currentUserId,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserLite, ApiError, { userId: string; patch: { username?: string; avatarUrl?: string } }>({
    mutationFn: async ({ userId, patch }) => {
      const r = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (!r.ok) {
        throw (await r.json()) as ApiError;
      }
      return (await r.json()) as UserLite;
    },
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData(['users', variables.userId], updatedUser);

      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (userId) => {
      const r = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!r.ok) {
        throw (await r.json()) as ApiError;
      }
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });

      queryClient.removeQueries({ queryKey: ['users', userId] });
    },
  });
}