"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/ui-store";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { CreateFromTemplateModal, EventTemplate } from "@/components/events/CreateFromTemplateModal";
import { Event, Task } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = "Bob";

  // ----- UI State Store -----
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

  // ----- Local State -----
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [personalTasks, setPersonalTasks] = useState<Task[]>(mockTasks);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [prefillData, setPrefillData] = useState<
    Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId"> | null
  >(null);

  // ----- Handlers -----
  const handleCreateEvent = (
    eventData: Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId">
  ) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ...eventData,
      progress: 0,
      tasks: [],
      createdAt: new Date().toISOString(),
      ownerId: currentUser,
    };
    setEvents((prev) => [...prev, newEvent]);
    closeAddEventModal();
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  const handleCreateTask = (taskData: Omit<Task, "id" | "status" | "createdAt">) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: "To Do",
      createdAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => [...prev, newTask]);
    closeAddTaskModal();
    toast.success(`Task "${taskData.title}" added successfully!`);
  };

  const handleSaveWidgets = (selected: string[]) => {
    setVisibleWidgets(selected);
    closeCustomizeModal();
    toast.success("Dashboard updated!");
  };

  const handleUseTemplate = (data: EventTemplate["eventData"]) => {
    setPrefillData({
      title: data.title,
      location: data.location,
      description: data.description || "",
      coverImage: data.coverImage,
      color: data.color || "bg-chart-1",
      date: "",
      time: "",
      members: [],
    });

    openAddEventModal();
  };

  // ----- Effect -----
  useEffect(() => {
    if (!isAddEventModalOpen) {
      setPrefillData(null);
    }
  }, [isAddEventModalOpen]);

  // ----- Render -----
  return (
    <>
      <Dashboard
        events={events}
        personalTasks={personalTasks}
        currentUser={currentUser}
        onCreateEvent={openAddEventModal}
        onEventClick={(id) => console.log("Event clicked:", id)}
        onCreatePersonalTask={openAddTaskModal}
        onCustomize={openCustomizeModal}
        visibleWidgets={visibleWidgets}
        onCreateFromTemplate={() => setIsTemplateModalOpen(true)}
      />

      {/* Modal: Add Event */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        prefillData={prefillData ?? undefined}
        onInviteMembers={() =>
          toast("Invite members feature coming soon!", { icon: "ℹ️" })
        }
      />

      {/* Modal: Add Task */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onCreateTask={handleCreateTask}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal={true}
      />

      {/* Modal: Customize Dashboard */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
        selectedWidgets={visibleWidgets}
        onSave={handleSaveWidgets}
        onResetDefault={resetWidgets}
      />

      {/* Modal: Create from Template */}
      <CreateFromTemplateModal
        isOpen={isTemplateModalOpen}
        templates={mockEvents.map((e) => ({
          id: e.id,
          name: e.title,
          description: e.description,
          createdBy: e.ownerId,
          createdAt: e.createdAt ?? new Date().toISOString(),
          eventData: {
            title: e.title,
            location: e.location,
            description: e.description,
            tasks: e.tasks.map((t) => ({ name: t.title })),
            coverImage: e.coverImage,
            color: e.color,
          },
        }))}
        onClose={() => setIsTemplateModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}
