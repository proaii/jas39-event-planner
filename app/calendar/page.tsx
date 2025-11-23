"use client";

import { useMemo, useState, useEffect } from "react";
import Calendar from "@/components/calendar/Calendar";
import { useFetchEvents } from "@/lib/client/features/events/hooks";
import { Event } from "@/lib/types";

type EventsPage = { items: Event[]; nextPage: number | null };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, isLoading, fetchNextPage, hasNextPage } = useFetchEvents({ date: currentDate });

  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const events = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page: EventsPage) => page.items);
  }, [data]);

  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      <Calendar events={events} isLoading={isLoading} currentDate={currentDate} setCurrentDate={setCurrentDate} />
    </main>
  );
}
