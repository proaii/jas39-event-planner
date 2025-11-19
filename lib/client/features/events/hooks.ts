'use client';

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/lib/errors';
import type { Event } from '@/lib/types';
import { MINUTES } from '@/lib/constants'

type EventsPage = { items: Event[]; nextPage: number | null };

// ---------- Events ----------

export function useEventsInfinite(f: { q?: string; pageSize?: number }) {
  const pageSize = f.pageSize ?? 10;

  return useInfiniteQuery<EventsPage, ApiError, EventsPage, ReturnType<typeof queryKeys.events>, number>({
    queryKey: queryKeys.events({ ...f, pageSize }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<EventsPage> => {
      const params = new URLSearchParams();
      if (f.q) params.set('q', f.q);
      params.set('page', String(pageParam ?? 1));
      params.set('pageSize', String(pageSize));

      const r = await fetch(`/api/events?${params.toString()}`, { cache: 'no-store' });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as EventsPage;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,

    staleTime: MINUTES.FIVE,
    gcTime: MINUTES.TEN,
    refetchOnWindowFocus: false, // No need to refetch when changing tabs.
    refetchOnReconnect: true, // But refetch if the internet is disconnected and comes back.
    retry: 1, // Reduce the number of retry to avoid spam API.
  });
}

export function useEvent(id: string) {
  return useQuery<Event, ApiError>({
    queryKey: queryKeys.event(id),
    queryFn: async () => {
      const r = await fetch(`/api/events/${id}`);
      if (!r.ok) throw await r.json();
      return (await r.json()) as Event;
    },
    staleTime: MINUTES.FIVE,
    refetchOnWindowFocus: false,
  });
}

// Use prefetch to preload events before entering the detail page.
export async function prefetchEvent(qc: ReturnType<typeof useQueryClient>, id: string) {
  await qc.prefetchQuery({
    queryKey: queryKeys.event(id),
    queryFn: async () => {
      const r = await fetch(`/api/events/${id}`);
      if (!r.ok) throw await r.json();
      return (await r.json()) as Event;
    },
    staleTime: MINUTES.FIVE,
  });
}

// ---------- Mutations ----------
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<Event, ApiError, Omit<Event, 'id' | 'tasks' | 'members'>>({
    mutationFn: async (payload) => {
      const r = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as Event;
    },
    onSuccess: (ev) => {
      qc.setQueryData(queryKeys.event(ev.eventId), ev);
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    retry: 0,
  });
}

export function useEditEvent() {
  const qc = useQueryClient();
  return useMutation<Event, ApiError, { id: string; patch: Partial<Event> }>({
    mutationFn: async ({ id, patch }) => {
      const r = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as Event;
    },
    onSuccess: (ev) => {
      qc.setQueryData(queryKeys.event(ev.eventId), ev);
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    retry: 0,
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation<string, ApiError, string>({
    mutationFn: async (id) => {
      const r = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!r.ok) throw (await r.json()) as ApiError;
      return id;
    },
    onSuccess: (eventId) => {
      qc.removeQueries({ queryKey: queryKeys.event(eventId) });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({
        predicate: (q) => {
          if (!Array.isArray(q.queryKey)) return false;
          if (q.queryKey[0] !== 'tasks') return false;
          const second = q.queryKey[1];
          return typeof second === 'object' && (second as { eventId?: string }).eventId === eventId;
        },
      });
      qc.invalidateQueries({ queryKey: queryKeys.members(eventId) });
    },
    retry: 0,
  });
}

