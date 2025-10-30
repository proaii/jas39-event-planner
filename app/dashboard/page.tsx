"use client";

import { useUiStore } from "@/stores/ui-store";
import { toast } from "react-hot-toast";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { useState } from "react";
import { Event, Task } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = "Bob";

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

  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [personalTasks, setPersonalTasks] = useState<Task[]>(mockTasks);

  const handleCreateEvent = (eventData: Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId">) => {
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
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        onInviteMembers={() => toast("Invite members feature coming soon!", { icon: "ℹ️" })}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onCreateTask={handleCreateTask}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal={true}
      />

      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={closeCustomizeModal}
        selectedWidgets={visibleWidgets}
        onSave={handleSaveWidgets}
        onResetDefault={resetWidgets}
      />
    </>
  );
}
