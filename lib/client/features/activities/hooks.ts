'use client';

import { useQuery } from '@tanstack/react-query';
import type { ActivityItem } from '@/lib/server/features/activities/api'; 
import { MINUTES } from '@/lib/constants'

export function useFetchRecentActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await fetch('/api/recent-activity');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },

    staleTime: MINUTES.ONE, 
  });
}