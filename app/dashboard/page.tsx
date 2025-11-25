"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Use sonner

import { useUiStore } from "@/stores/ui-store";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { CreateFromTemplateModal } from "@/components/events/CreateFromTemplateModal";

import type { ApiError } from "@/lib/errors";
import { useFetchEvents, useCreateEvent } from "@/lib/client/features/events/hooks";
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useFetchUsers } from "@/lib/client/features/users/hooks";
import { useFetchTemplates } from "@/lib/client/features/templates/hooks";
import { useFetchUser } from "@/lib/client/features/users/hooks"; // Should be from auth hooks
import { useUser } from "@/lib/client/features/auth/hooks"; // Added this

import type { Event, Task } from "@/lib/types"; // Adjusted Event type if necessary
import type { TemplateData } from "@/schemas/template";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"; // Import DashboardSkeleton
import { AlertCircle } from "lucide-react"; // Import AlertCircle
import { useState } from "react"; // For local dashboardConfig

type DashboardCreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt"
>;

export default function DashboardPage() {
  const router = useRouter();
  const { data: authUser } = useUser();
  const { data: currentUserData, isLoading: isCurrentUserLoading, isError: isCurrentUserError } = useFetchUser(authUser?.id ?? ""); // Use currentUserData for user details

  const [dashboardConfig, setDashboardConfig] = useState({
    upcomingEvents: true,
    recentActivity: true,
    upcomingDeadlines: true,
    progressOverview: true,
    miniCalendar: false,
  });

  const {
    isAddEventModalOpen,
    isAddTaskModalOpen,
    isCustomizeModalOpen,
    isCreateFromTemplateModalOpen,
    openAddEventModal,
    closeAddEventModal,
    openAddTaskModal,
    closeAddTaskModal,
    openCustomizeModal,
    closeCustomizeModal,
    openCreateFromTemplateModal,
    closeCreateFromTemplateModal,
    setEventPrefillData,
    // Widgets
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visibleWidgets,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setVisibleWidgets, 
  } = useUiStore();

  const { data: eventsData, isLoading: isEventsLoading, isError: isEventsError } = useFetchEvents({});
  const { data: tasksData, isLoading: isTasksLoading, isError: isTasksError } = useFetchAllTasks({});
  const { data: allUsers = [], isLoading: isAllUsersLoading, isError: isAllUsersError } = useFetchUsers({ q: "", enabled: true });
  const { data: templates = [] } = useFetchTemplates();

  const events: Event[] = eventsData || [];
  const tasks: Task[] = tasksData || [];

  const isLoadingPage = isEventsLoading || isTasksLoading || isAllUsersLoading || isCurrentUserLoading; // isCurrentUserLoading should be from useFetchUser
  const isErrorPage = isEventsError || isTasksError || isAllUsersError || isCurrentUserError || !currentUserData; // !currentUserData instead of !currentUser

  const createEventMutation = useCreateEvent();

  const handleCreateEvent = (payload: DashboardCreateEventInput) => {
    createEventMutation.mutate(payload, {
      onSuccess: () => {
        closeAddEventModal();
        toast.success("Event created successfully!");
      },
      onError: (error: ApiError) => {
        toast.error(error?.message || "Failed to create event");
      },
    });
  };

  const handleUseTemplate = (templateData: TemplateData) => {
    setEventPrefillData({
      title: templateData.title,
      location: templateData.location || "",
      description: templateData.eventDescription || "",
      coverImageUri: templateData.coverImageUri ?? undefined,
      color: templateData.color,
      startAt: templateData.startAt,
      endAt: templateData.endAt,
      members: templateData.members,
    });
    closeCreateFromTemplateModal();
    openAddEventModal();
    toast.success("Template loaded! Fill in the remaining details.");
  };

  if (isLoadingPage) {
    return <DashboardSkeleton />;
  }

  if (isErrorPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertCircle className="w-16 h-16" />
          <p className="text-center text-lg">
            Failed to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Dashboard
        events={events}
        tasks={tasks}
        onCreateEvent={openAddEventModal}
        onEventClick={(id) => router.push(`/events/${id}`)}
        onCreatePersonalTask={openAddTaskModal}
        onCustomize={openCustomizeModal}
        dashboardConfig={dashboardConfig} // Pass local dashboardConfig
        setDashboardConfig={setDashboardConfig} // Pass local setDashboardConfig
        onCreateFromTemplate={openCreateFromTemplateModal}
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUserData} // Pass currentUserData (UserLite object)
        isPersonal={true}
      />

      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
        dashboardConfig={dashboardConfig} // Pass local dashboardConfig
        setDashboardConfig={setDashboardConfig} // Pass local setDashboardConfig
      />

      <CreateFromTemplateModal
        isOpen={isCreateFromTemplateModalOpen}
        onClose={closeCreateFromTemplateModal}
        onUseTemplate={handleUseTemplate}
        templates={templates}
      />
    </>
  );
}