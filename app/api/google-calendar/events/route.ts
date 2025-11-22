import { getGoogleCalendarEvents, createGoogleCalendarEvent } from '@/lib/server/features/google-calendar/api';
import { jsonError } from '@/lib/errors';
import { createEvent } from '@/lib/server/features/events/api';
import type { Event } from '@/lib/types';

/**
 * GET /api/google-calendar/events
 * Get events from Google Calendar
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    const timeMin = searchParams.get('timeMin') || undefined;
    const timeMax = searchParams.get('timeMax') || undefined;

    const events = await getGoogleCalendarEvents(calendarId, timeMin, timeMax);
    return Response.json({ items: events });
  } catch (e) {
    return jsonError(e);
  }
}

/**
 * POST /api/google-calendar/events
 * Create an event in Google Calendar and sync with local database
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, syncToLocal = false, calendarId = 'primary' } = body;

    // Create in Google Calendar
    const googleEventId = await createGoogleCalendarEvent(event as Event, calendarId);

    // Optionally sync to local database
    let localEvent: Event | null = null;
    if (syncToLocal) {
      localEvent = await createEvent(event);
    }

    return Response.json(
      {
        googleEventId,
        localEvent,
        message: 'Event created successfully in Google Calendar',
      },
      { status: 201 }
    );
  } catch (e) {
    return jsonError(e);
  }
}

