'use client';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Task } from '@/lib/types';
import type { ApiError } from '@/lib/errors';

type TasksPage = { items: Task[]; nextPage: number | null };

// ---------- Queries ----------

/**
 * Fetch all tasks
 * - Cache in memory
 * - No refresh if returned within 5 minutes
 * - No re-refetch when switching tabs
 * - Supports prefetch (can load in advance)
 */

// List Task of a single Event (For the Event Detail page)
export function useTasksInfinite(f: {
  eventId: string;
  status?: Task['taskStatus'];  // << เปลี่ยนจาก status เป็น taskStatus
  q?: string;
  pageSize?: number;
}) {
  const pageSize = f.pageSize ?? 20;

  return useInfiniteQuery<TasksPage, ApiError, TasksPage, ReturnType<typeof queryKeys.tasks>, number>({
    queryKey: queryKeys.tasks({ eventId: f.eventId, status: f.status, pageSize, q: f.q }),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams();
      if (f.status) params.set('status', f.status); // ชื่อ query ยังใช้ status ตาม API route เดิม
      if (f.q) params.set('q', f.q);
      params.set('page', String(pageParam));
      params.set('pageSize', String(pageSize));

      const r = await fetch(`/api/events/${f.eventId}/tasks?${params.toString()}`, {
        cache: 'no-store',
        signal,
      });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as TasksPage;
    },
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// List all User's Tasks (Personal + Assignee) (For the All Tasks page)
export function useAllTasksInfinite(f: {
  status?: Task['taskStatus'];
  q?: string;
  pageSize?: number;
}) {
  const pageSize = f.pageSize ?? 20;

  return useInfiniteQuery<TasksPage, ApiError, TasksPage, ReturnType<typeof queryKeys.tasks>, number>({
    queryKey: queryKeys.tasks({ status: f.status, pageSize, q: f.q }),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }): Promise<TasksPage> => {
      const params = new URLSearchParams();
      if (f.status) params.set('status', f.status);
      if (f.q) params.set('q', f.q);
      params.set('page', String(pageParam));
      params.set('pageSize', String(pageSize));

      const r = await fetch(`/api/tasks?${params.toString()}`, { cache: 'no-store', signal });
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as TasksPage;
    },
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// ---------- Mutations ----------
export function useCreateEventTask(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'taskId' | 'eventTitle'>) => {
      const r = await fetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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

export function useCreatePersonalTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'taskId' | 'eventId' | 'eventTitle'>) => {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks({}) });
    },
    retry: 0,
  });
}

export function useEditTask(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) => {
      const r = await fetch(`/api/events/${eventId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(queryKeys.task(task.taskId), task);
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