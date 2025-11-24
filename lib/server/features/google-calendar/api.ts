// import { google } from 'googleapis';
import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Event } from '@/lib/types';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Get authenticated Google Calendar client
 */
async function getGoogleCalendarClient() {
  const root = await createClient();
  const { data: { user }, error: uerr } = await root.auth.getUser();
  if (uerr) throw uerr;
  if (!user) throw new Error('UNAUTHORIZED');

  // Get user's Google OAuth token from Supabase (you'll need to store this)
  // For now, we'll check for it in environment or user metadata
  const accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('GOOGLE_CALENDAR_NOT_AUTHENTICATED');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Convert our Event type to Google Calendar event format
 */
function eventToGoogleCalendar(event: Event): any {
  return {
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    start: {
      dateTime: event.startAt || new Date().toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: event.endAt || new Date().toISOString(),
      timeZone: 'UTC',
    },
    extendedProperties: {
      private: {
        eventId: event.eventId,
        ownerId: event.ownerId,
      },
    },
  };
}

/**
 * Convert Google Calendar event to our Event type
 */
function googleCalendarToEvent(googleEvent: any, ownerId: string): Partial<Event> {
  return {
    title: googleEvent.summary || '',
    description: googleEvent.description || '',
    location: googleEvent.location || '',
    startAt: googleEvent.start?.dateTime || googleEvent.start?.date || null,
    endAt: googleEvent.end?.dateTime || googleEvent.end?.date || null,
  };
}

/**
 * Get all events from Google Calendar
 */
export async function getGoogleCalendarEvents(
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string
): Promise<any[]> {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const params: any = {
      calendarId,
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;

    const response = await calendar.events.list(params);
    return response.data.items || [];
  } catch (e) {
    throw toApiError(e, 'GOOGLE_CALENDAR_GET_EVENTS_FAILED');
  }
}

/**
 * Create an event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  event: Event,
  calendarId: string = 'primary'
): Promise<string> {
  try {
    const calendar = await getGoogleCalendarClient();
    const googleEvent = eventToGoogleCalendar(event);

    const response = await calendar.events.insert({
      calendarId,
      requestBody: googleEvent,
    });

    return response.data.id || '';
  } catch (e) {
    throw toApiError(e, 'GOOGLE_CALENDAR_CREATE_EVENT_FAILED');
  }
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  googleEventId: string,
  event: Partial<Event>,
  calendarId: string = 'primary'
): Promise<void> {
  try {
    const calendar = await getGoogleCalendarClient();

    // First, get the existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId: googleEventId,
    });

    if (!existingEvent.data) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // Update the event
    const updatedEvent = {
      ...existingEvent.data,
      summary: event.title ?? existingEvent.data.summary,
      description: event.description ?? existingEvent.data.description,
      location: event.location ?? existingEvent.data.location,
      start: event.startAt
        ? { dateTime: event.startAt, timeZone: 'UTC' }
        : existingEvent.data.start,
      end: event.endAt
        ? { dateTime: event.endAt, timeZone: 'UTC' }
        : existingEvent.data.end,
    };

    await calendar.events.update({
      calendarId,
      eventId: googleEventId,
      requestBody: updatedEvent,
    });
  } catch (e) {
    throw toApiError(e, 'GOOGLE_CALENDAR_UPDATE_EVENT_FAILED');
  }
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  googleEventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  try {
    const calendar = await getGoogleCalendarClient();
    await calendar.events.delete({
      calendarId,
      eventId: googleEventId,
    });
  } catch (e) {
    throw toApiError(e, 'GOOGLE_CALENDAR_DELETE_EVENT_FAILED');
  }
}

/**
 * Get Google Calendar OAuth URL for authentication
 */
export function getGoogleCalendarAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCalendarCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return {
    access_token: tokens.access_token || '',
    refresh_token: tokens.refresh_token,
  };
}

