'use client';

import { useMemo } from "react";
import { Event, Task } from "@/lib/types";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget";
import { ProgressOverviewWidget } from "./progress-overview-widget";

import { useFetchEvents } from "@/stores/useEventStore"; 
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";

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
  // ---- FETCH DATA ----
  const { 
    data: eventsData, 
    isLoading: loadingEvents, 
    isError: errorEvents 
  } = useFetchEvents();
  
  const { 
    data: tasksData, 
    isLoading: loadingTasks, 
    isError: errorTasks 
  } = useFetchAllTasks({ pageSize: 20 });

  // ---- FLATTEN DATA ----
  const events: Event[] = useMemo(() => flattenInfiniteData<Event>(eventsData), [eventsData]);
  const tasks: Task[] = useMemo(() => flattenInfiniteData<Task>(tasksData), [tasksData]);

  // ---- LOADING STATE ----
  if (loadingEvents || loadingTasks) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-lg border p-6 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---- ERROR STATE - Show individual widget errors instead of blocking all ----
  // Each widget will handle its own error states
  
  // ---- RENDER ----
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