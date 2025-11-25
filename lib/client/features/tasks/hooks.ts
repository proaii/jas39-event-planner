'use client';

import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Task, Subtask } from '@/lib/types';
import type { ApiError } from '@/lib/errors';
import { MINUTES } from '@/lib/constants';

type TasksPage = { items: Task[]; nextPage: number | null };

// List Task of a single Event (For the Event Detail page)
export function useFetchEventTasks(f: {
  eventId: string | null;
  status?: Task['taskStatus'];  
  q?: string;
  pageSize?: number;
  enabled?: boolean;
}) {
  const pageSize = f.pageSize ?? 20;

  return useInfiniteQuery<TasksPage, ApiError, Task[], ReturnType<typeof queryKeys.tasks>, number>({
    queryKey: queryKeys.tasks({ eventId: f.eventId, status: f.status, pageSize, q: f.q }),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams();
      if (f.status) params.set('status', f.status);
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
    select: (data) => data.pages.flatMap(page => page.items),
    staleTime: MINUTES.FIVE,
    gcTime: MINUTES.TEN,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: f.enabled,
  });
}

// List all User's Tasks (Personal + Assignee) (For the All Tasks page)
export function useFetchAllTasks(f: {
  status?: Task['taskStatus'];
  q?: string;
  pageSize?: number;
}) {
  const pageSize = f.pageSize ?? 20;

  return useInfiniteQuery<TasksPage, ApiError, Task[], ReturnType<typeof queryKeys.tasks>, number>({
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
    select: (data) => data.pages.flatMap(page => page.items), // This will flatten the pages
    staleTime: MINUTES.FIVE,
    gcTime: MINUTES.TEN,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useFetchTask(taskId: string) {
  return useQuery<Task, ApiError>({
    queryKey: queryKeys.task(taskId),
    queryFn: async () => {
      const r = await fetch(`/api/tasks/${taskId}`);
      if (!r.ok) throw (await r.json()) as ApiError;
      return (await r.json()) as Task;
    },
    enabled: !!taskId,
    staleTime: MINUTES.FIVE, 
    refetchOnWindowFocus: false,
  });
}

// ---------- Task Mutations ----------

export function useCreateEventTask(eventId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'taskId' | 'eventTitle' | 'createdAt'>) => {
      const r = await fetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: (data) => {
      if (data.eventId) {
        qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId: data.eventId }) });
        qc.invalidateQueries({ queryKey: queryKeys.event(data.eventId) });
        qc.invalidateQueries({ queryKey: ['event-activity', data.eventId] });
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.tasks({}) });
      }
    },
    retry: 0,
  });
}

export function useCreatePersonalTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'taskId' | 'eventId' | 'eventTitle' | 'createdAt'>) => {
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

export function useEditTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) => {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(queryKeys.task(task.taskId), task);
      
      qc.invalidateQueries({ queryKey: queryKeys.tasks({}) }); // All Tasks
      if (task.eventId) {
        qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId: task.eventId }) });
        qc.invalidateQueries({ queryKey: ['event-activity', task.eventId] });
      }
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) => {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Task;
    },
    onSuccess: (task) => {
      qc.setQueryData(queryKeys.task(task.taskId), task);
      qc.invalidateQueries({ queryKey: queryKeys.tasks({}) }); // Invalidate all tasks query
      if (task.eventId) {
        qc.invalidateQueries({ queryKey: queryKeys.tasks({ eventId: task.eventId }) }); // Invalidate event-specific tasks
      }
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const r = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!r.ok) throw await r.json();
      return taskId; 
    },
    onSuccess: (taskId) => {
      qc.removeQueries({ queryKey: queryKeys.task(taskId) });
      qc.invalidateQueries({ queryKey: ['tasks'] }); 
    },
  });
}

// ---------- Subtask Mutations ----------

export function useCreateSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; status?: Subtask['subtaskStatus'] }) => {
      const r = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Subtask;
    },
    onSuccess: (newSubtask) => {
      // Update Cache Parent Task
      qc.setQueryData<Task>(queryKeys.task(taskId), (old) => {
        if (!old) return old;
        return {
          ...old,
          subtasks: [...(old.subtasks || []), newSubtask],
        };
      });
    },
  });
}

export function useUpdateSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subtaskId,
      patch,
    }: {
      subtaskId: string;
      patch: { title?: string; subtaskStatus?: Subtask['subtaskStatus'] };
    }) => {
      const r = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw await r.json();
      return (await r.json()) as Subtask;
    },
    onSuccess: (updatedSubtask) => {
      // Update Cache Parent Task
      if (updatedSubtask.taskId) {
        qc.setQueryData<Task>(queryKeys.task(updatedSubtask.taskId), (old) => {
          if (!old || !old.subtasks) return old;
          return {
            ...old,
            subtasks: old.subtasks.map((s) =>
              s.subtaskId === updatedSubtask.subtaskId ? updatedSubtask : s
            ),
          };
        });
      }
    },
  });
}

export function useDeleteSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ subtaskId }: { subtaskId: string }) => {
      const r = await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
      if (!r.ok) throw await r.json();
      return subtaskId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] }); 
    },
  });
}