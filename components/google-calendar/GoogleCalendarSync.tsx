"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useGoogleCalendarAuth,
  useExchangeGoogleCalendarCode,
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  useGoogleCalendarEvents,
} from "@/lib/client/features/google-calendar/hooks";
import type { Event } from "@/lib/types";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface GoogleCalendarSyncProps {
  event?: Event;
  googleEventId?: string;
  onSync?: () => void;
}

export function GoogleCalendarSync({
  event,
  googleEventId,
  onSync,
}: GoogleCalendarSyncProps) {
  const { data: authUrl, refetch: getAuthUrl } = useGoogleCalendarAuth();
  const exchangeCode = useExchangeGoogleCalendarCode();
  const createEvent = useCreateGoogleCalendarEvent();
  const updateEvent = useUpdateGoogleCalendarEvent();
  const deleteEvent = useDeleteGoogleCalendarEvent();
  const { data: googleEvents, isLoading, isError } = useGoogleCalendarEvents();

  // Check if user is authenticated - if we can fetch events without error, they're authenticated
  const isAuthenticated = !isError && (googleEvents !== undefined || isLoading);

  const handleConnect = async () => {
    await getAuthUrl();
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleCreateInGoogleCalendar = async () => {
    if (!event) return;

    try {
      await createEvent.mutateAsync({
        event,
        options: { syncToLocal: false },
      });
      onSync?.();
    } catch (error) {
      console.error("Failed to create event in Google Calendar:", error);
    }
  };

  const handleUpdateInGoogleCalendar = async () => {
    if (!event || !googleEventId) return;

    try {
      await updateEvent.mutateAsync({
        eventId: event.eventId,
        googleEventId,
        event,
        options: { syncToLocal: false },
      });
      onSync?.();
    } catch (error) {
      console.error("Failed to update event in Google Calendar:", error);
    }
  };

  const handleDeleteFromGoogleCalendar = async () => {
    if (!event || !googleEventId) return;

    try {
      await deleteEvent.mutateAsync({
        eventId: event.eventId,
        googleEventId,
        options: { syncToLocal: false },
      });
      onSync?.();
    } catch (error) {
      console.error("Failed to delete event from Google Calendar:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={handleConnect}
        variant="outline"
        className="w-full"
        disabled={!authUrl}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Connect Google Calendar
      </Button>
    );
  }

  if (!event) {
    return (
      <div className="text-sm text-muted-foreground">
        No event selected for sync
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!googleEventId ? (
        <Button
          onClick={handleCreateInGoogleCalendar}
          variant="outline"
          className="w-full"
          disabled={createEvent.isPending}
        >
          {createEvent.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Create in Google Calendar
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Synced with Google Calendar
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateInGoogleCalendar}
              variant="outline"
              size="sm"
              disabled={updateEvent.isPending}
              className="flex-1"
            >
              {updateEvent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
            <Button
              onClick={handleDeleteFromGoogleCalendar}
              variant="outline"
              size="sm"
              disabled={deleteEvent.isPending}
              className="flex-1"
            >
              {deleteEvent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

