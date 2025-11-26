"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { type CalendarItem } from "@/app/calendar/page";
import { useUiStore } from "@/stores/ui-store";

export default function Calendar({
  items,
  isLoading,
  currentDate,
  setCurrentDateAction,
}: {
  items: CalendarItem[];
  isLoading: boolean;
  currentDate: Date;
  setCurrentDateAction: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const router = useRouter();
  const { openTaskDetailModal } = useUiStore();

  const itemsByDate = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.startAt) return false;
        const itemDate = new Date(item.startAt);
        return (
          itemDate.getFullYear() === currentDate.getFullYear() &&
          itemDate.getMonth() === currentDate.getMonth()
        );
      })
      .reduce((acc: Record<string, typeof items>, item) => {
        if (item.startAt) {
          const itemDate = new Date(item.startAt);
          const key = `${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
        }
        return acc;
      }, {});
  }, [items, currentDate]);

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
    setCurrentDateAction(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDateAction(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
  };

  const hasItems = (day: number) => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return !!itemsByDate[key];
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

  const itemsForSelectedDate = selectedDate
    ? itemsByDate[
        `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
      ] || []
    : [];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleItemClick = (item: CalendarItem) => {
    if (item.eventId) {
      router.push(`/events/${item.eventId}`);
    } else {
      router.push(`/tasks`);
      openTaskDetailModal(item.id);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          {isLoading && <p>Loading...</p>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CalendarDays className="w-5 h-5" />
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
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
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const today = isToday(day);
                    const selected = isSelected(day);
                    const hasItem = hasItems(day);

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all relative
                          ${
                            selected
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : today
                              ? "bg-muted text-foreground hover:bg-muted/80"
                              : "hover:bg-muted text-foreground"
                          }
                        `}
                      >
                        {day}
                        {hasItem && (
                          <span
                            className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                              selected ? "bg-primary-foreground" : "bg-primary"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-secondary text-secondary-foreground">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {itemsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {itemsForSelectedDate.map((item) => (
                      <div
                        key={item.id}
                        className="group p-4 border border-border rounded-xl hover:shadow-md transition-all duration-200 bg-card hover:border-primary cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {item.startAt && (
                              <span>{formatTime(item.startAt)}</span>
                            )}
                          </div>

                          {item.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{item.location}</span>
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
                    <p className="text-muted-foreground text-sm">
                      No tasks due
                    </p>
                    <p className="text-muted-foreground/80 text-xs mt-1">
                      Select a different date to view deadlines
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Tasks This Month
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {items.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Tasks Due Today
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {
                      items.filter((e) => {
                        if (!e.startAt) return false;
                        const itemDate = new Date(e.startAt);
                        const today = new Date();
                        return itemDate.toDateString() === today.toDateString();
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}