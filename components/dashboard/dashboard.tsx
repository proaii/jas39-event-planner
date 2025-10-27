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
  onStyleGuide?: () => void;
  onNotifications?: () => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onAddTask?: (eventId: string) => void;
  onCreatePersonalTask?: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  // Navigation handlers
  onNavigateToAllEvents?: () => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSettings?: () => void;
}

export function Dashboard({
  events,
  personalTasks,
  currentUser,
  onCreateEvent,
  onCreateFromTemplate,
  onEventClick,
  onNavigateToAllEvents,
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllTasks,
}: DashboardProps) {
  return (
    <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <WelcomeHeader
          currentUser={currentUser}
          onCreateEvent={onCreateEvent}
          onCreateFromTemplate={onCreateFromTemplate}
        />
        <div className="space-y-8">
          <DashboardWidgets events={events} onEventClick={onEventClick} onNavigateToAllEvents={onNavigateToAllEvents} />
          <MyTasksSection
            events={events}
            personalTasks={personalTasks}
            currentUser={currentUser}
            onStatusChange={onStatusChange}
            onSubTaskToggle={onSubTaskToggle}
            onNavigateToAllTasks={onNavigateToAllTasks}
          />
        </div>
      </div>
    </main>
  );
}
