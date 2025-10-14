'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Member } from '@/lib/server/features/members/api';

export function useMembers(eventId: string) {
  return useQuery({
    queryKey: queryKeys.members(eventId),
    queryFn: async () => {
      const r = await fetch(`/api/events/${eventId}/members`);
      if (!r.ok) throw await r.json();
      return (await r.json()) as Member[];
    },
  });
}

export function useInviteMember(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const r = await fetch(`/api/events/${eventId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) });
      if (!r.ok) throw await r.json();
      return await r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) });
    },
    retry: 0,
  });
}

export function useRemoveMember(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const r = await fetch(`/api/events/${eventId}/members/${userId}`, { method: 'DELETE' });
      if (!r.ok) throw await r.json();
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) });
    },
    retry: 0,
  });
}