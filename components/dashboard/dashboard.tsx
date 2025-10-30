"use client";

import { WelcomeHeader } from "./welcome-header";
import { DashboardWidgets } from "./dashboard-widgets";
import { MyTasksSection } from "./my-tasks-section";
import { Event, Task } from "@/lib/types";

interface DashboardProps {
  events: Event[];
  personalTasks: Task[];
  currentUser: string;
  onCreateEvent: () => void;
  onCreateFromTemplate?: () => void;
  onEventClick: (eventId: string) => void;
  onCreatePersonalTask: () => void; 
  visibleWidgets?: string[]; 
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onNavigateToAllEvents?: () => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onCustomize?: () => void; 
}

export function Dashboard({
  events,
  personalTasks,
  currentUser,
  onCreateEvent,
  onCreateFromTemplate,
  onEventClick,
  onCreatePersonalTask, 
  visibleWidgets = ["upcomingEvents","recentActivity","upcomingDeadlines","progressOverview"],
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllEvents,
  onNavigateToAllTasks,
  onCustomize,
}: DashboardProps) {
  return (
    <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <WelcomeHeader
          currentUser={currentUser}
          onCreateEvent={onCreateEvent}
          onCreateFromTemplate={onCreateFromTemplate}
          onOpenCustomizeDashboard={onCustomize} 
        />
        <div className="space-y-8">
          <DashboardWidgets
            events={events}
            onEventClick={onEventClick}
            onNavigateToAllEvents={onNavigateToAllEvents}
            visibleWidgets={visibleWidgets} 
          />
          <MyTasksSection
            events={events}
            personalTasks={personalTasks}
            currentUser={currentUser}
            onStatusChange={onStatusChange}
            onSubTaskToggle={onSubTaskToggle}
            onNavigateToAllTasks={onNavigateToAllTasks}
            onCreatePersonalTask={onCreatePersonalTask} 
          />
        </div>
      </div>
    </main>
  );
}
