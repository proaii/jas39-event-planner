'use client';

import { Event, Task } from "@/lib/types";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { UpcomingDeadlinesWidget } from "./upcoming-deadlines-widget";
import { ProgressOverviewWidget } from "./progress-overview-widget";

interface DashboardWidgetsProps {
  events: Event[];
  tasks: Task[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
  visibleWidgets: string[];
}

export function DashboardWidgets({
  events,
  tasks,
  onEventClick,
  onNavigateToAllEvents,
  visibleWidgets = ["upcomingEvents","recentActivity","upcomingDeadlines","progressOverview"],
}: DashboardWidgetsProps) {
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
      {visibleWidgets.includes("upcomingDeadlines") && <UpcomingDeadlinesWidget tasks={tasks} />}
      {visibleWidgets.includes("progressOverview") && <ProgressOverviewWidget events={events} tasks={tasks} />}
    </div>
  );
}