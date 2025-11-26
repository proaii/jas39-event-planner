'use client';
import { useQuery } from '@tanstack/react-query';
import type { ActivityItem } from '@/lib/types';
import { MINUTES } from '@/lib/constants';

export function useFetchRecentActivities() {
  return useQuery<ActivityItem[]>({
    queryKey: ['activities', 'recent'], 
    queryFn: async () => {
      const res = await fetch('/api/activities/recent');
      if (!res.ok) throw new Error('Failed to fetch recent activities');
      return res.json();
    },
    staleTime: MINUTES.ONE,
    refetchOnWindowFocus: true, 
  });
}

export function useFetchRecentEventActivity(eventId: string) {
  return useQuery<ActivityItem[]>({
    queryKey: ['event-activity', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const res = await fetch(`/api/events/${eventId}/activities`); 
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    enabled: !!eventId,
    staleTime: MINUTES.ONE,
  });
}