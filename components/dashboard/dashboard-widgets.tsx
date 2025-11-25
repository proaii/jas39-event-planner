'use client';

import React from "react"; // Only need React here, not useEffect, useMemo
import { Event, Task } from "@/lib/types";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget";
import { ProgressOverviewWidget } from "./progress-overview-widget";

interface DashboardWidgetsProps {
  visibleWidgets?: string[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
  events: Event[]; // Added events
  tasks: Task[]; // Added tasks
}

export function DashboardWidgets({
  visibleWidgets = [], // No default value here, parent passes it
  onEventClick,
  onNavigateToAllEvents,
  events,
  tasks,
}: DashboardWidgetsProps) {

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