"use client";

import { useMemo, useState } from "react";
import Calendar from "@/components/calendar/Calendar";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/lib/types";

export interface CalendarItem {
  id: string;
  title: string;
  startAt?: string | null;
  endAt?: string | null;
  color: number;
  eventId: string | null;
  description?: string;
  location?: string;
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks");

  const result = await res.json();

  if (result && Array.isArray(result.items)) {
    return result.items as Task[];
  } else if (Array.isArray(result)) {
    return result as Task[];
  }
  return [];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const calendarItems: CalendarItem[] = useMemo(() => {
    if (!data) return [];
    return data.map((task: Task) => ({
      id: task.taskId,
      title: task.title,
      startAt: task.endAt,
      endAt: task.endAt,
      color: 1, // Default color
      eventId: task.eventId,
      description: task.description,
      location: undefined,
    }));
  }, [data]);

  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      <Calendar
        items={calendarItems}
        isLoading={isLoading}
        currentDate={currentDate}
        setCurrentDateAction={setCurrentDate}
      />
    </main>
  );
}
