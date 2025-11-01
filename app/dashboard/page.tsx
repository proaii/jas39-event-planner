"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/ui-store";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { CreateFromTemplateModal } from "@/components/events/CreateFromTemplateModal"; 
import type { TemplateData } from "@/components/events/SaveTemplateModal";
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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [prefillData, setPrefillData] = useState<
    Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId"> | null
  >(null);

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

  const handleUseTemplate = (data: TemplateData) => {
    setPrefillData({
      title: data.title,
      location: data.location || "",
      description: data.eventDescription || "",
      coverImage: data.coverImage,
      color: data.color || "bg-chart-1",
      date: data.date,
      time: data.time,
      members: data.members,
    });

    openAddEventModal();
  };

  useEffect(() => {
    if (!isAddEventModalOpen) {
      setPrefillData(null);
    }
  }, [isAddEventModalOpen]);

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

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        prefillData={prefillData ?? undefined}
        onInviteMembers={() =>
          toast("Invite members feature coming soon!", { icon: "ℹ️" })
        }
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

      <CreateFromTemplateModal
        isOpen={isTemplateModalOpen}
        templates={mockEvents.map((e) => ({
          name: e.title,
          description: e.description,
          title: e.title,
          date: "",
          time: "",
          endDate: undefined,
          endTime: undefined,
          location: e.location,
          eventDescription: e.description,
          tasks: e.tasks.map((t) => ({
            title: t.title,
            status: "To Do",
            priority: "Normal",
            dueDate: undefined,
          })),
          members: [e.ownerId],
        }))}
        onClose={() => setIsTemplateModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}
