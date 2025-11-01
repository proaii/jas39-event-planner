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
}

export function DashboardWidgets({
  events,
  tasks,
  onEventClick,
  onNavigateToAllEvents,
}: DashboardWidgetsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UpcomingEventsWidget
          events={events}
          onEventClick={onEventClick}
          onNavigateToAllEvents={onNavigateToAllEvents}
        />
        <RecentActivityWidget />
        <UpcomingDeadlinesWidget tasks={tasks} />
        <ProgressOverviewWidget events={events} tasks={tasks} />
      </div>
    </div>
  );
}
