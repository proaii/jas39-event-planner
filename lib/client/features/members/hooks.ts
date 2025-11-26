'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/lib/errors';
import type { MembersRes } from '@/lib/types';
import { MINUTES } from '@/lib/constants';

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
    staleTime: MINUTES.FIVE,
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
      const r = await fetch(`/api/events/${eventId}/members/${memberId}`, { 
        method: 'DELETE' 
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