"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetchEvents, useCreateEvent } from "@/lib/client/features/events/hooks";
import { useGoogleCalendarEvents } from "@/lib/client/features/google-calendar/hooks";
import { GoogleCalendarSync } from "@/components/google-calendar/GoogleCalendarSync";
import { AddEventModal } from "@/components/events/AddEventModal";
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { toast } from "react-hot-toast";

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { isAddEventModalOpen, openAddEventModal, closeAddEventModal } = useUiStore();
  const createEvent = useCreateEvent();

  // Fetch all events (with pagination)
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    fetchNextPage,
    hasNextPage,
  } = useFetchEvents({ pageSize: 100 });

  // Flatten all events from all pages
  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    // useInfiniteQuery returns data with pages array
    const pages = (eventsData as any)?.pages;
    if (!pages) return [];
    return pages.flatMap((page: { items: Event[]; nextPage: number | null }) => page.items);
  }, [eventsData]);

  // Fetch Google Calendar events for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { data: googleEvents, isLoading: isLoadingGoogle } = useGoogleCalendarEvents({
    timeMin: monthStart.toISOString(),
    timeMax: monthEnd.toISOString(),
  });

  // Get events for the selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((event: Event) => {
      if (!event.startAt) return false;
      const eventDate = parseISO(event.startAt);
      return isSameDay(eventDate, selectedDate);
    });
  }, [allEvents, selectedDate]);

  // Get all dates that have events for calendar highlighting
  const eventDates = useMemo(() => {
    return allEvents
      .filter((event: Event) => event.startAt)
      .map((event: Event) => parseISO(event.startAt!));
  }, [allEvents]);

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return eventDates.some((eventDate: Date) => isSameDay(eventDate, date));
  };


  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentMonth(date);
    }
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  // Format event time
  const formatEventTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  // Load more events if needed
  const loadMoreEvents = () => {
    if (hasNextPage && !isLoadingEvents) {
      fetchNextPage();
    }
  };

  // Handle event creation
  const handleCreateEvent = async (
    eventData: Omit<Event, "eventId" | "ownerId" | "createdAt" | "members">
  ) => {
    try {
      // The hook expects Omit<Event, 'id' | 'tasks' | 'members'> but Event doesn't have 'id' or 'tasks'
      // So we pass the eventData as-is and let the API handle it
      await createEvent.mutateAsync(eventData as any);
      toast.success(`Event "${eventData.title}" created successfully!`);
      closeAddEventModal();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage your events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={goToToday} variant="outline">
            Today
          </Button>
          <Button
            onClick={openAddEventModal}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  hasEvents: (date) => hasEvents(date),
                }}
                modifiersClassNames={{
                  hasEvents: "bg-primary/10 font-semibold",
                }}
              />
              {isLoadingEvents && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading events...</span>
                </div>
              )}
              {hasNextPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMoreEvents}
                  className="w-full mt-4"
                  disabled={isLoadingEvents}
                >
                  {isLoadingEvents ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Events"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No events on this date</p>
                </div>
              ) : (
                selectedDateEvents.map((event: Event) => (
                  <div
                    key={event.eventId}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      "hover:bg-accent hover:border-primary/50"
                    )}
                    onClick={() => handleEventClick(event.eventId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {event.title}
                        </h3>
                        {event.startAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatEventTime(event.startAt)}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${event.color}, 70%, 50%)`,
                          }}
                        />
                        <GoogleCalendarSync
                          event={event}
                          googleEventId={undefined} // TODO: Store googleEventId in event
                          onSync={() => {
                            // Refresh events
                            window.location.reload();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Google Calendar Events */}
          {googleEvents && googleEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Google Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingGoogle ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  googleEvents.slice(0, 5).map((googleEvent: any) => (
                    <div
                      key={googleEvent.id}
                      className="p-3 rounded-lg border bg-muted/50"
                    >
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {googleEvent.summary || "Untitled Event"}
                      </h4>
                      {googleEvent.start?.dateTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(googleEvent.start.dateTime), "h:mm a")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        onInviteMembers={() => toast("Invite members feature coming soon!", { icon: "ℹ️" })}
      />
    </div>
  );
}



