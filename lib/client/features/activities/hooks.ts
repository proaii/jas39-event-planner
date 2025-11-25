'use client';
import { useQuery } from '@tanstack/react-query';
import type { ActivityItem } from '@/lib/types';
import { MINUTES } from '@/lib/constants';

export function useFetchRecentActivity(eventId: string) {
  return useQuery<ActivityItem[]>({
    queryKey: ['event-activity', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const res = await fetch(`/api/events/${eventId}/activity`); 
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    enabled: !!eventId,
    staleTime: MINUTES.ONE,
  });
}