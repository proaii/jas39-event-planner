'use client';

import { WelcomeHeader } from "./welcome-header";
import { DashboardWidgets } from "./dashboard-widgets";
import { MyTasksSection } from "./my-tasks-section";
import { Event, Task } from "@/lib/types";
 

interface DashboardProps {
  events: Event[];
  tasks: Task[];
  onCreateEvent: () => void;
  onCreateFromTemplate?: () => void;
  onEventClick: (eventId: string) => void;
  onCreatePersonalTask: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["taskStatus"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onNavigateToAllEvents?: () => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onCustomize?: () => void;
  visibleWidgets?: string[];
  dashboardConfig: {
    upcomingEvents: boolean;
    recentActivity: boolean;
    upcomingDeadlines: boolean;
    progressOverview: boolean;
    miniCalendar: boolean;
  };
  setDashboardConfig: (config: {
    upcomingEvents: boolean;
    recentActivity: boolean;
    upcomingDeadlines: boolean;
    progressOverview: boolean;
    miniCalendar: boolean;
  }) => void;
}

export function Dashboard({
  events,
  tasks,
  onCreateEvent,
  onCreateFromTemplate,
  onEventClick,
  onCreatePersonalTask,
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllEvents,
  onNavigateToAllTasks,
  onCustomize,
  visibleWidgets,
  dashboardConfig,
  setDashboardConfig,
}: DashboardProps) {
  return (
    <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <WelcomeHeader
          onCreateEvent={onCreateEvent}
          onCreateFromTemplate={onCreateFromTemplate}
          onOpenCustomizeDashboard={onCustomize}
        />

        <div className="space-y-8">
          <DashboardWidgets
            visibleWidgets={visibleWidgets}
            onEventClick={onEventClick}
            onNavigateToAllEvents={onNavigateToAllEvents}
            events={events} // Pass events
            tasks={tasks}
            dashboardConfig={dashboardConfig}
            setDashboardConfig={setDashboardConfig}
          />

          <MyTasksSection
            onStatusChange={onStatusChange}
            onSubTaskToggle={onSubTaskToggle}
            onNavigateToAllTasks={onNavigateToAllTasks}
            onCreatePersonalTask={onCreatePersonalTask}
            tasks={tasks} // Pass tasks
            events={events} // Pass events
          />
        </div>
      </div>
    </main>
  );
}