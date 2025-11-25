"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/calendar/Calendar";
import { useFetchEvents } from "@/lib/client/features/events/hooks";
import { type Task } from "@/lib/types";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, isLoading, fetchNextPage, hasNextPage } = useFetchEvents({});

  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const events = data || [];

  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      <Calendar events={events} isLoading={isLoading} currentDate={currentDate} setCurrentDate={setCurrentDate} />
    </main>
  );
}
