import {
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '@/lib/server/features/google-calendar/api';
import { jsonError } from '@/lib/errors';
import { updateEvent, deleteEvent } from '@/lib/server/features/events/api';
import type { Event } from '@/lib/types';

/**
 * PATCH /api/google-calendar/events/[eventId]
 * Update an event in Google Calendar and optionally sync with local database
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const body = await req.json();
    const {
      googleEventId,
      event,
      syncToLocal = false,
      localEventId,
      calendarId = 'primary',
    } = body;

    if (!googleEventId) {
      return Response.json(
        { error: 'googleEventId is required' },
        { status: 400 }
      );
    }

    // Update in Google Calendar
    await updateGoogleCalendarEvent(googleEventId, event as Partial<Event>, calendarId);

    // Optionally sync to local database
    let localEvent: Event | null = null;
    if (syncToLocal && localEventId) {
      localEvent = await updateEvent(localEventId, event);
    }

    return Response.json({
      googleEventId,
      localEvent,
      message: 'Event updated successfully in Google Calendar',
    });
  } catch (e) {
    return jsonError(e);
  }
}

/**
 * DELETE /api/google-calendar/events/[eventId]
 * Delete an event from Google Calendar and optionally from local database
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const { searchParams } = new URL(req.url);
    const googleEventId = searchParams.get('googleEventId');
    const syncToLocal = searchParams.get('syncToLocal') === 'true';
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!googleEventId) {
      return Response.json(
        { error: 'googleEventId query parameter is required' },
        { status: 400 }
      );
    }

    // Delete from Google Calendar
    await deleteGoogleCalendarEvent(googleEventId, calendarId);

    // Optionally delete from local database
    if (syncToLocal) {
      await deleteEvent(eventId);
    }

    return Response.json({
      message: 'Event deleted successfully from Google Calendar',
    });
  } catch (e) {
    return jsonError(e);
  }
}

