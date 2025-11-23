"use client";

import { toast } from "react-hot-toast";

import { useUiStore } from "@/stores/ui-store";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { CreateFromTemplateModal } from "@/components/events/CreateFromTemplateModal";

import { useFetchEvents, useCreateEvent } from "@/stores/useEventStore";
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useFetchUsers, useFetchUser } from "@/lib/client/features/users/hooks";
import { useUser } from "@/lib/client/features/auth/hooks";
import type { Event } from "@/lib/types";

type DashboardCreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt" | "members"
>;

// -------------------------------------------------
// Dashboard Page — Main landing page for the user
// -------------------------------------------------
export default function DashboardPage() {
  const { data: authUser } = useUser();
  const { data: currentUser } = useFetchUser(authUser?.id ?? "");

  // ==================== UI STORE ====================
  const {
    // Modals
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
    
    // Widgets
    visibleWidgets,
  } = useUiStore();

  // ==================== DATA FETCHING ====================
  const { data: eventsData, isLoading: eventsLoading } = useFetchEvents();
  const { data: tasksData } = useFetchAllTasks({});
  const { data: allUsers = [] } = useFetchUsers({ q: "", enabled: true });

  const events: Event[] = eventsData?.items ?? [];
  
  // FIX: useFetchAllTasks returns TasksPage directly, not infinite query
  const tasks = tasksData?.items ?? [];

  // ==================== MUTATIONS ====================
  const createEventMutation = useCreateEvent();

  // -------------------------------------------------
  // Create Event Handler
  // -------------------------------------------------
  const handleCreateEvent = (payload: DashboardCreateEventInput) => {
    createEventMutation.mutate(payload, {
      onSuccess: () => {
        closeAddEventModal();
        toast.success("Event created successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create event");
      },
    });
  };

  // -------------------------------------------------
  // Handle Template Use → Open AddEventModal with prefill
  // -------------------------------------------------
  const handleUseTemplate = (templateData: any) => {
    // Store template data in UI store for AddEventModal to prefill
    // TODO: Add setEventPrefillData() to ui-store.ts
    closeCreateFromTemplateModal();
    openAddEventModal();
    toast.success("Template loaded! Fill in the remaining details.");
  };

  // -------------------------------------------------
  // Show loading state
  // -------------------------------------------------
  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  // -------------------------------------------------
  // Render UI
  // -------------------------------------------------
  return (
    <>
      {/* ---------------- Dashboard Main View ---------------- */}
      <Dashboard
        events={events}
        tasks={tasks}
        onCreateEvent={openAddEventModal}
        onEventClick={(id) => console.log("Clicked event:", id)}
        onCreatePersonalTask={openAddTaskModal}
        onCustomize={openCustomizeModal}
        visibleWidgets={visibleWidgets}
        onCreateFromTemplate={openCreateFromTemplateModal}
      />

      {/* ---------------- Add Event Modal ---------------- */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
      />

      {/* ---------------- Add Task Modal ---------------- */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUser}
        isPersonal={true}
      />

      {/* ---------------- Customize Dashboard Modal ---------------- */}
      {/* FIX: Removed selectedWidgets, onSave, and onResetDefault props */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
      />

      {/* ---------------- Create From Template Modal ---------------- */}
      {/* FIX: Removed templates prop - component fetches its own */}
      <CreateFromTemplateModal
        isOpen={isCreateFromTemplateModalOpen}
        onClose={closeCreateFromTemplateModal}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}