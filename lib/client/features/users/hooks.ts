'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/lib/errors';
import type { UserLite } from '@/lib/types';
import { MINUTES } from '@/lib/constants'

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