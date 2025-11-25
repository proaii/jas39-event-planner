"use client";

import { useMemo, useState, useEffect } from "react";
import Calendar from "@/components/calendar/Calendar";
import { useFetchEvents } from "@/lib/client/features/events/hooks";
import { Event } from "@/lib/types";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading } = useFetchEvents({});

  const events = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);

  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      <Calendar
      events={events}
      isLoading={isLoading}
      currentDate={currentDate}
      setCurrentDateAction={setCurrentDate} 
     />
    </main>
  );
}
