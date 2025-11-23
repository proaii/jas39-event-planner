'use client';

import { WelcomeHeader } from "./welcome-header";
import { DashboardWidgets } from "./dashboard-widgets";
import { MyTasksSection } from "./my-tasks-section";
import { Event, Task } from "@/lib/types";
import { useDashboardUiStore } from "@/stores/dashboard-ui-store";

interface DashboardProps {
  events: Event[];
  tasks: Task[];
  currentUser: string;
  onCreateEvent: () => void;
  onCreateFromTemplate?: () => void;
  onEventClick: (eventId: string) => void;
  onCreatePersonalTask: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["taskStatus"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onNavigateToAllEvents?: () => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onCustomize?: () => void;
}

export function Dashboard({
  events,
  tasks,
  currentUser,
  onCreateEvent,
  onCreateFromTemplate,
  onEventClick,
  onCreatePersonalTask,
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllEvents,
  onNavigateToAllTasks,
  onCustomize,
}: DashboardProps) {
  // ดึง visibleWidgets จาก store แทนการส่ง props
  const { visibleWidgets } = useDashboardUiStore();

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
            visibleWidgets={visibleWidgets}
            onEventClick={onEventClick}
            onNavigateToAllEvents={onNavigateToAllEvents}
          />

          <MyTasksSection
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
