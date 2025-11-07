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
import type { TemplateData } from "@/components/events/SaveTemplateModal";
import type { Event, Task, UserLite } from "@/lib/types";

// -------------------------------------------------
// Dashboard Page — Main landing page for the user
// -------------------------------------------------
export default function DashboardPage() {
  // ---------------- Current User (Mock) ----------------
  const currentUser: UserLite = {
    userId: "user-1",
    username: "Bob",
    email: "bob@example.com",
  };

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
  const { data, isLoading } = useFetchEvents();

  // ✅ FIX: add explicit type to avoid implicit `any`
  const events: Event[] = data?.items ?? [];

  // ---------------- Local Tasks (temporary mock) ----------------
  const [tasks, setTasks] = useState<Task[]>([]);

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
    payload: Omit<Event, "eventId" | "ownerId" | "createdAt" | "members">
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
  // Create Task (Local Only — Placeholder)
  // -------------------------------------------------
  const handleCreateTask = (taskData: Omit<Task, "taskId" | "createdAt">) => {
    const newTask: Task = {
      taskId: `task-${Date.now()}`,
      ...taskData,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    closeAddTaskModal();
    toast.success(`Task "${taskData.title}" added successfully!`);
  };

  // -------------------------------------------------
  // Placeholder: Invite Members
  // -------------------------------------------------
  const handleInviteMembers = () => {
    toast("Invite members feature coming soon!", { icon: "ℹ️" });
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
      coverImageUri: data.coverImageUri,
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
        currentUser={currentUser.username}
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
        onInviteMembers={handleInviteMembers}
      />

      {/* ---------------- Add Task Modal ---------------- */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onCreateTask={handleCreateTask}
        eventMembers={[]}
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
