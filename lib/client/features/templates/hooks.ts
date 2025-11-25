'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/lib/errors';
import type { EventTemplate } from '@/lib/types';
import type { TemplateData } from '@/schemas/template';
import { MINUTES } from '@/lib/constants';

// ---------- Event Templates ----------

export function useFetchTemplates(eventId?: string) {
  return useQuery<EventTemplate[], ApiError>({
    queryKey: ['templates', eventId ?? 'all'],
    queryFn: async () => {
      const url = eventId
        ? `/api/events/${eventId}/templates`  // per-event (e.g. if you ever want that)
        : `/api/templates`;                   // global list for dashboard

      const r = await fetch(url);
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as EventTemplate[];
    },
    staleTime: MINUTES.FIVE,
  });
}

export function useSaveTemplate() {
  const qc = useQueryClient();

  return useMutation<
    EventTemplate,
    ApiError,
    { eventId: string; data: TemplateData }
  >({
    mutationFn: async ({ eventId, data }) => {
      const r = await fetch(`/api/events/${eventId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as EventTemplate;
    },
    onSuccess: () => {
      // invalidate both per-event and global views
      qc.invalidateQueries({ queryKey: ['templates'] });
      qc.invalidateQueries({ queryKey: ['templates', 'all'] });
    },
  });
}
