"use client";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";

import { useFetchEvents, useCreateEvent } from "@/stores/useEventStore";
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useFetchUsers } from "@/lib/client/features/users/hooks";
import { useFetchCurrentUser } from "@/lib/client/features/users/hooks";
import type { Event } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardCreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt"
>;

export default function DashboardPage() {
  const router = useRouter();

  // ==================== UI STORE ====================
  const {
    isAddEventModalOpen,
    isAddTaskModalOpen,
    isCustomizeModalOpen,
    openAddEventModal,
    closeAddEventModal,
    openAddTaskModal,
    closeAddTaskModal,
    openCustomizeModal,
    closeCustomizeModal,
    visibleWidgets,
  } = useUiStore();

  // ==================== DATA FETCHING ====================
  const {
    data: currentUser,
    isLoading: userLoading
  } = useFetchCurrentUser();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsQueryError,
  } = useFetchEvents();

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksQueryError,
  } = useFetchAllTasks({});

  const {
    data: allUsers = [],
  } = useFetchUsers({ q: "", enabled: true });

  const events: Event[] = eventsData?.items ?? [];
  const tasks = tasksData?.items ?? [];

  // ==================== MUTATIONS ====================
  const createEventMutation = useCreateEvent();

  const handleCreateEvent = (payload: DashboardCreateEventInput) => {
    createEventMutation.mutate(payload, {
      onSuccess: () => {
        closeAddEventModal();
        toast.success("Event created successfully!");
      },
      onError: (error: Error) => {
        toast.error(error?.message || "Failed to create event");
      },
    });
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const isLoading = eventsLoading || tasksLoading || userLoading;

  // -------------------------------------------------
  // Loading State
  // -------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>

          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // Error State
  // -------------------------------------------------
  if (eventsError || tasksError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>

          <p className="text-muted-foreground mb-4">
            {eventsQueryError?.message ||
              tasksQueryError?.message ||
              "Something went wrong"}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // Render UI
  // -------------------------------------------------
  return (
    <>
      <Dashboard
        events={events}
        tasks={tasks}
        onCreateEvent={openAddEventModal}
        onEventClick={handleEventClick}
        onCreatePersonalTask={openAddTaskModal}
        onCustomize={openCustomizeModal}
        visibleWidgets={visibleWidgets}
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
        currentUser={currentUser}
        isPersonal={true}
      />

      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
      />
    </>
  );
}