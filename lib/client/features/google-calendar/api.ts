import type { Event } from '@/lib/types';

const API_BASE = '/api/google-calendar';

/**
 * Get Google Calendar OAuth URL
 */
export async function getGoogleCalendarAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth`);
  if (!response.ok) {
    throw new Error('Failed to get Google Calendar auth URL');
  }
  const data = await response.json();
  return data.authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCalendarCode(code: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Get events from Google Calendar
 */
export async function getGoogleCalendarEvents(params?: {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.calendarId) searchParams.set('calendarId', params.calendarId);
  if (params?.timeMin) searchParams.set('timeMin', params.timeMin);
  if (params?.timeMax) searchParams.set('timeMax', params.timeMax);

  const response = await fetch(`${API_BASE}/events?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to get Google Calendar events');
  }
  const data = await response.json();
  return data.items || [];
}

/**
 * Create an event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  event: Event,
  options?: {
    syncToLocal?: boolean;
    calendarId?: string;
  }
): Promise<{ googleEventId: string; localEvent?: Event }> {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      syncToLocal: options?.syncToLocal ?? false,
      calendarId: options?.calendarId ?? 'primary',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Google Calendar event');
  }

  return await response.json();
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  googleEventId: string,
  event: Partial<Event>,
  options?: {
    syncToLocal?: boolean;
    calendarId?: string;
  }
): Promise<{ localEvent?: Event }> {
  const response = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      googleEventId,
      event,
      syncToLocal: options?.syncToLocal ?? false,
      localEventId: eventId,
      calendarId: options?.calendarId ?? 'primary',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update Google Calendar event');
  }

  return await response.json();
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  eventId: string,
  googleEventId: string,
  options?: {
    syncToLocal?: boolean;
    calendarId?: string;
  }
): Promise<void> {
  const searchParams = new URLSearchParams();
  searchParams.set('googleEventId', googleEventId);
  if (options?.syncToLocal) searchParams.set('syncToLocal', 'true');
  if (options?.calendarId) searchParams.set('calendarId', options.calendarId);

  const response = await fetch(
    `${API_BASE}/events/${eventId}?${searchParams.toString()}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete Google Calendar event');
  }
}

