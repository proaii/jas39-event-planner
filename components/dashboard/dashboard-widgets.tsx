'use client'; 

import { create } from "zustand";
import { Event, Task } from "@/lib/types";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget";
import { ProgressOverviewWidget } from "./progress-overview-widget";
import { useFetchEvents } from "@/lib/client/features/events/hooks";
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useEffect } from "react";
import type { InfiniteData } from '@tanstack/react-query';

// UI state for Dashboard Widgets
interface DashboardWidgetsUiState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
}

const useDashboardWidgetsUiStore = create<DashboardWidgetsUiState>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
}));

interface DashboardWidgetsProps {
  visibleWidgets?: string[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
}

export function DashboardWidgets({
  visibleWidgets = ["upcomingEvents","recentActivity","upcomingDeadlines","progressOverview"],
  onEventClick,
  onNavigateToAllEvents,
}: DashboardWidgetsProps) {
  const { isLoading, error, setLoading, setError } = useDashboardWidgetsUiStore();

  const {
    data: eventsPages,
    isLoading: loadingEvents,
    error: errorEvents
  } = useFetchEvents({ pageSize: 10 });

  const {
    data: tasksPages,
    isLoading: loadingTasks,
    error: errorTasks
  } = useFetchAllTasks({ pageSize: 20 });

  // Flatten pages to array with proper type casting
  const events: Event[] = (eventsPages as InfiniteData<{ items: Event[] }> | undefined)?.pages
    ?.flatMap(page => page.items) ?? [];

  const tasks: Task[] = (tasksPages as InfiniteData<{ items: Task[] }> | undefined)?.pages
    ?.flatMap(page => page.items) ?? [];

  // Update UI state safely
  useEffect(() => {
    setLoading(loadingEvents || loadingTasks);
    setError(errorEvents?.message || errorTasks?.message || null);
  }, [loadingEvents, loadingTasks, errorEvents, errorTasks, setLoading, setError]);

  if (isLoading) return <p>Loading widgets...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {visibleWidgets.includes("upcomingEvents") && (
        <UpcomingEventsWidget
          events={events}
          onEventClick={onEventClick}
          onNavigateToAllEvents={onNavigateToAllEvents}
        />
      )}
      {visibleWidgets.includes("recentActivity") && <RecentActivityWidget />}
      {visibleWidgets.includes("upcomingDeadlines") && (
        <UpcomingDeadlinesWidget tasks={tasks} />
      )}
      {visibleWidgets.includes("progressOverview") && (
        <ProgressOverviewWidget events={events} tasks={tasks} />
      )}
    </div>
  );
}
