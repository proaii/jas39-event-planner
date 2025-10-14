'use client';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Task } from '@/lib/types';
import type { ApiError } from '@/lib/errors';

type TasksPage = { items: Task[]; nextPage: number | null };

export function useTasksInfinite(f: {
  eventId: string;
  status?: Task['status'];
  q?: string;
  pageSize?: number;
}) {
  const pageSize = f.pageSize ?? 20;

  return useInfiniteQuery<TasksPage, ApiError, TasksPage, ReturnType<typeof queryKeys.tasks>, number>({
    queryKey: queryKeys.tasks({ eventId: f.eventId, status: f.status, pageSize, q: f.q }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: number }): Promise<TasksPage> => {
      const params = new URLSearchParams();
      if (f.status) params.set('status', f.status);
      if (f.q) params.set('q', f.q);
      params.set('page', String(pageParam));
      params.set('pageSize', String(pageSize));

      const r = await fetch(`/api/events/${f.eventId}/tasks?${params.toString()}`);
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as TasksPage;
    },
    getNextPageParam: (last: TasksPage): number | undefined => last.nextPage ?? undefined,
  });
}

// Mutations
export function useCreateTask(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'id'|'eventTitle'>) => {
      const r = await fetch(`/api/events/${eventId}/tasks`, { method: 'POST', body: JSON.stringify(payload) });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId }) });
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) });
    },
    retry: 0,
  });
}

export function useEditTask(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) => {
      const r = await fetch(`/api/events/${eventId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(patch) });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(queryKeys.task(task.id), task);
      qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId }) });
    },
    retry: 0,
  });
}

export function useDeleteTask(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const r = await fetch(`/api/events/${eventId}/tasks/${taskId}`, { method: 'DELETE' });
      if (!r.ok) throw await r.json();
      return true;
    },
    onSuccess: (_ok, taskId) => {
      qc.removeQueries({ queryKey: queryKeys.task(taskId) });
      qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId }) });
    },
    retry: 0,
  });
}