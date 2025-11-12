'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/lib/errors';
import type { MembersRes, UserLite } from '@/lib/types';

/* ------------------------------- All Users ------------------------------- */

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

export function useAllUsers(opts: UseAllUsersOpts = {}) {
  const { q, enabled = true } = opts;

  return useQuery<UserLite[], ApiError>({
    queryKey: ['all-users', { q: q ?? '' }],
    enabled,
    staleTime: 1000 * 60 * 5,
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

/* ------------------------------- Members ------------------------------- */

export function useMembers(eventId: string) {
  return useQuery<MembersRes, ApiError>({
    queryKey: queryKeys.members(eventId),
    queryFn: async () => {
      const r = await fetch(`/api/events/${eventId}/members`);
      if (!r.ok) {
        const err = (await r.json()) as unknown;
        throw err as ApiError;
      }
      return (await r.json()) as MembersRes;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useAddMember(eventId: string) {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, ApiError, { memberId: string; role?: string }>({
    mutationFn: async (payload) => {
      const r = await fetch(`/api/events/${eventId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = (await r.json()) as unknown;
        throw err as ApiError;
      }
      return (await r.json()) as { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(eventId) });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) });
    },
    retry: 0,
  });
}

export function useRemoveMember(eventId: string) {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, ApiError, { memberId: string }>({
    mutationFn: async ({ memberId }) => {
      const r = await fetch(`/api/events/${eventId}/members/${memberId}`, { method: 'DELETE' });
      if (!r.ok) {
        const err = (await r.json()) as unknown;
        throw err as ApiError;
      }
      return (await r.json()) as { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(eventId) });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) });
    },
    retry: 0,
  });
}