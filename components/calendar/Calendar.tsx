"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from "lucide-react"; // Import Plus icon

import { Event } from "@/lib/types";
import { createEvent as createIcsEvent, EventAttributes } from 'ics';
import { AddEventModal } from "@/components/events/AddEventModal"; // Import the modal
import { useCreateEvent } from "@/lib/client/features/events/hooks"; // Import the hook

function downloadIcsFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Calendar({ events, isLoading, currentDate, setCurrentDate }: { events: Event[], isLoading: boolean, currentDate: Date, setCurrentDate: (date: Date) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false); // State for modal
  const router = useRouter(); // Initialize useRouter
  const createEventMutation = useCreateEvent(); // Initialize the mutation hook

  const eventsByDate = useMemo(() => {
    return events
      .filter(event => {
        if (!event.startAt) return false;
        const eventDate = new Date(event.startAt);
        return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth();
      })
      .reduce((acc: Record<string, typeof events>, event) => {
        if (event.startAt) {
          const eventDate = new Date(event.startAt);
          const key = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(event);
        }
        return acc;
      }, {});
  }, [events, currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const hasEvents = (day: number) => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return !!eventsByDate[key];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const handleExport = (event: Event) => {
    const startAt = new Date(event.startAt!);
    const endAt = new Date(event.endAt!);

    const icsEvent: EventAttributes = {
      start: [startAt.getFullYear(), startAt.getMonth() + 1, startAt.getDate(), startAt.getHours(), startAt.getMinutes()],
      end: [endAt.getFullYear(), endAt.getMonth() + 1, endAt.getDate(), endAt.getHours(), endAt.getMinutes()],
      title: event.title,
      description: event.description,
      location: event.location,
    };

    createIcsEvent(icsEvent, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      downloadIcsFile(value, `${event.title}.ics`);
    });
  };

  const handleCreateEvent = (eventData: Omit<Event, 'eventId' | 'ownerId' | 'createdAt'>) => {
    createEventMutation.mutate(eventData);
  };

  const eventsForSelectedDate = selectedDate
    ? eventsByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || []
    : [];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          {isLoading && <p>Loading...</p>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Card */}
            <Card className="lg:col-span-2 shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CalendarDays className="w-5 h-5" />
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary/90"
                      onClick={handlePrevMonth}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary/90"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const today = isToday(day);
                    const selected = isSelected(day);
                    const hasEvent = hasEvents(day);

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all relative
                          ${selected
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : today
                              ? 'bg-muted text-foreground hover:bg-muted/80'
                              : 'hover:bg-muted text-foreground'
                          }
                        `}
                      >
                        {day}
                        {hasEvent && (
                          <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full ${selected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Events List Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-secondary text-secondary-foreground">
                <div className="flex items-center justify-between"> {/* Added div for layout */}
                  <CardTitle className="text-lg">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsAddEventModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {eventsForSelectedDate.map((event) => (
                      <div
                        key={event.eventId}
                        className="group p-4 border border-border rounded-xl hover:shadow-md transition-all duration-200 bg-card hover:border-primary cursor-pointer"
                        onClick={() => handleEventClick(event.eventId)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(event)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2 h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {event.startAt && event.endAt && <span>{formatDateRange(event.startAt, event.endAt)}</span>}
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <CalendarDays className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No events scheduled</p>
                    <p className="text-muted-foreground/80 text-xs mt-1">Select a different date to view events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Count Summary */}
          <Card className="mt-6 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Events This Month</p>
                  <p className="text-3xl font-bold text-foreground">{events.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Events Today</p>
                  <p className="text-3xl font-bold text-primary">
                    {events.filter(e => {
                      if (!e.startAt) return false;
                      const eventDate = new Date(e.startAt);
                      const today = new Date();
                      return eventDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onCreateEvent={handleCreateEvent}
        defaultDate={selectedDate}
      />
    </>
  );
}

