'use client';

import { useEffect, useMemo } from "react";
import { Event, Task } from "@/lib/types";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget";
import { ProgressOverviewWidget } from "./progress-overview-widget";

import { useFetchEvents } from "@/stores/useEventStore"; 
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useUiStore } from "@/stores/ui-store"; 

interface DashboardWidgetsProps {
  visibleWidgets?: string[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
}

// ---- HELPER: flatten paginated/infinite query data ----
function flattenInfiniteData<T>(data?: { pages?: { items: T[] }[]; items?: T[] }): T[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (data.pages && Array.isArray(data.pages)) {
    return data.pages.flatMap(p => Array.isArray(p.items) ? p.items : []);
  }
  return [];
}

export function DashboardWidgets({
  visibleWidgets = [
    "upcomingEvents",
    "recentActivity",
    "upcomingDeadlines",
    "progressOverview",
  ],
  onEventClick,
  onNavigateToAllEvents,
}: DashboardWidgetsProps) {
  const { isLoading, error, setLoading, setError } = useUiStore();

  // ---- FETCH DATA ----
  const { data: eventsData, isLoading: loadingEvents, error: errorEvents } = useFetchEvents();
  const { data: tasksData, isLoading: loadingTasks, error: errorTasks } = useFetchAllTasks({ pageSize: 20 });

  // ---- FLATTEN DATA ----
  const events: Event[] = useMemo(() => flattenInfiniteData<Event>(eventsData), [eventsData]);
  const tasks: Task[] = useMemo(() => flattenInfiniteData<Task>(tasksData), [tasksData]);

  // ---- SYNC UI STATE ----
  useEffect(() => {
    setLoading(loadingEvents || loadingTasks);
    const mergedError = errorEvents?.message || errorTasks?.message || null;
    setError(mergedError);
  }, [loadingEvents, loadingTasks, errorEvents, errorTasks, setLoading, setError]);

  // ---- RENDER ----
  if (isLoading) {
    return <p>Loading widgets...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {visibleWidgets.includes("upcomingEvents") && (
        <UpcomingEventsWidget
          events={events}
          onEventClick={onEventClick}
          onNavigateToAllEvents={onNavigateToAllEvents}
        />
      )}

      {visibleWidgets.includes("recentActivity") && (
        <RecentActivityWidget />
      )}

      {visibleWidgets.includes("upcomingDeadlines") && (
        <UpcomingDeadlinesWidget tasks={tasks} />
      )}

      {visibleWidgets.includes("progressOverview") && (
        <ProgressOverviewWidget
          events={events}
          tasks={tasks}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}