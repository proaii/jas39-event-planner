"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useUiStore } from "@/stores/ui-store";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { CreateFromTemplateModal } from "@/components/events/CreateFromTemplateModal";

import { useFetchEvents, useCreateEvent } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/task-store"; 
import { TemplateData } from "@/schemas/template";
import { useFetchUsers, useFetchUser } from "@/lib/client/features/users/hooks";
import { useUser } from "@/lib/client/features/auth/hooks";
import type { Event } from "@/lib/types"; // Import Event type

type DashboardCreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt" | "members"
>;

// -------------------------------------------------
// Dashboard Page — Main landing page for the user
// -------------------------------------------------
export default function DashboardPage() {
  const { data: authUser } = useUser();
  const { data: currentUser } = useFetchUser(
    authUser?.id ?? ""
  );

  // ------------------- USERS -------------------
  const [userSearchQuery] = useState("");
  const { data: allUsers = [] } = useFetchUsers({
    q: userSearchQuery,
    enabled: true,
  });

  // ---------------- UI Store ----------------
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
    setVisibleWidgets,
    resetWidgets,
  } = useUiStore();

  // ---------------- Fetch Events from API ----------------
  const { data } = useFetchEvents();
  const events: Event[] = data?.items ?? [];

  const { tasks } = useTaskStore();

  // ---------------- Mutation: Create Event ----------------
  const createEventMutation = useCreateEvent();

  // ---------------- Template Modal State ----------------
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // ---------------- Prefill Data for AddEventModal ----------------
  const [prefillData, setPrefillData] = useState<
    Omit<Event, "eventId" | "ownerId" | "createdAt" | "members"> | null
  >(null);

  // -------------------------------------------------
  // Create Event Handler — Uses React Query Mutation
  // -------------------------------------------------
  const handleCreateEvent = (
    payload: DashboardCreateEventInput
  ) => {
    createEventMutation.mutate(
      {
        title: payload.title,
        location: payload.location,
        description: payload.description,
        coverImageUri: payload.coverImageUri,
        color: payload.color,
        startAt: payload.startAt,
        endAt: payload.endAt,
      },
      {
        onSuccess: () => {
          toast.success(`Event "${payload.title}" created successfully!`);
        },
      }
    );
  };

  // -------------------------------------------------
  // Save Widgets / Customize Dashboard
  // -------------------------------------------------
  const handleSaveWidgets = (selected: string[]) => {
    setVisibleWidgets(selected);
    closeCustomizeModal();
    toast.success("Dashboard updated!");
  };

  // -------------------------------------------------
  // Handle Template Use → Prefill AddEventModal
  // -------------------------------------------------
  const handleUseTemplate = (data: TemplateData) => {
    setPrefillData({
      title: data.title ?? data.name,
      location: data.location || "",
      description: data.eventDescription || "",
      coverImageUri: data.coverImageUri ?? undefined,
      color: data.color ?? 0,
      startAt: data.startAt ?? null,
      endAt: data.endAt ?? null,
    });

    openAddEventModal();
  };

  // -------------------------------------------------
  // Reset prefill when modal closes
  // -------------------------------------------------
  useEffect(() => {
    if (!isAddEventModalOpen) {
      setPrefillData(null);
    }
  }, [isAddEventModalOpen]);

  // -------------------------------------------------
  // Render UI
  // -------------------------------------------------
  return (
    <>
      {/* ---------------- Dashboard Main View ---------------- */}
      <Dashboard
        events={events}
        tasks={tasks}
        currentUser={currentUser?.username ?? "Loading..."}
        onCreateEvent={openAddEventModal}
        onEventClick={(id) => console.log("Clicked event:", id)}
        onCreatePersonalTask={openAddTaskModal}
        onCustomize={openCustomizeModal}
        visibleWidgets={visibleWidgets}
        onCreateFromTemplate={() => setIsTemplateModalOpen(true)}
      />

      {/* ---------------- Add Event Modal ---------------- */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        prefillData={prefillData ?? undefined}
      />

      {/* ---------------- Add Task Modal (use store, API users) ---------------- */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUser}
        isPersonal={true}
      />

      {/* ---------------- Customize Dashboard Modal ---------------- */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
        selectedWidgets={visibleWidgets}
        onSave={handleSaveWidgets}
        onResetDefault={resetWidgets}
      />

      {/* ---------------- Create From Template Modal ---------------- */}
      <CreateFromTemplateModal
        isOpen={isTemplateModalOpen}
        templates={events.map((event: Event) => ({
          name: event.title,
          description: event.description,
          title: event.title,
          location: event.location,
          eventDescription: event.description,
          coverImageUri: event.coverImageUri,
          color: event.color,
          startAt: event.startAt,
          endAt: event.endAt,
          members: event.members,
        }))}
        onClose={() => setIsTemplateModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}
