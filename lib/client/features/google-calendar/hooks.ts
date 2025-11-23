"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGoogleCalendarAuthUrl,
  exchangeGoogleCalendarCode,
} from './api';
import type { Event } from '@/lib/types';

/**
 * Hook to get Google Calendar OAuth URL
 */
export function useGoogleCalendarAuth() {
  return useQuery({
    queryKey: ['google-calendar', 'auth-url'],
    queryFn: getGoogleCalendarAuthUrl,
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Hook to exchange authorization code
 */
export function useExchangeGoogleCalendarCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exchangeGoogleCalendarCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar'] });
    },
  });
}

/**
 * Hook to get Google Calendar events
 */
export function useGoogleCalendarEvents(params?: {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
}) {
  return useQuery({
    queryKey: ['google-calendar', 'events', params],
    queryFn: () => getGoogleCalendarEvents(params),
  });
}

/**
 * Hook to create a Google Calendar event
 */
export function useCreateGoogleCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      event,
      options,
    }: {
      event: Event;
      options?: { syncToLocal?: boolean; calendarId?: string };
    }) => createGoogleCalendarEvent(event, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Hook to update a Google Calendar event
 */
export function useUpdateGoogleCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      googleEventId,
      event,
      options,
    }: {
      eventId: string;
      googleEventId: string;
      event: Partial<Event>;
      options?: { syncToLocal?: boolean; calendarId?: string };
    }) => updateGoogleCalendarEvent(eventId, googleEventId, event, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Hook to delete a Google Calendar event
 */
export function useDeleteGoogleCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      googleEventId,
      options,
    }: {
      eventId: string;
      googleEventId: string;
      options?: { syncToLocal?: boolean; calendarId?: string };
    }) => deleteGoogleCalendarEvent(eventId, googleEventId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

