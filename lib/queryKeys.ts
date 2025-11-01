import type { Task } from '@/lib/types';

export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    user: ['auth', 'user'] as const,
  },

  events: (f: { 
    ownerId?: string; 
    q?: string; 
    page?: number; 
    pageSize?: number 
  }) => ['events', { ...f }] as const,
  event: (id: string) => ['event', { id }] as const,

  tasks: (f: {
    eventId?: string;
    status?: Task['taskStatus'];
    q?: string;
    page?: number;
    pageSize?: number;
  }) => ['tasks', { ...f }] as const,
  task: (id: string) => ['task', { id }] as const,

  members: (eventId: string) => ['members', { eventId }] as const,
};