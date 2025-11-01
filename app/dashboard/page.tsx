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
    Omit<Event, "eventId" | "ownerId" | "createdAt" | "members"> | null
  >(null);

  const handleCreateEvent = (
    eventData: Omit<Event, "eventId" | "ownerId" | "createdAt" | "members">
  ) => {
    const newEvent: Event = {
      eventId: `event-${Date.now()}`,
      ownerId: currentUser,
      createdAt: new Date().toISOString(),
      members: [],
      ...eventData,
    };
    setEvents((prev) => [...prev, newEvent]);
    closeAddEventModal();
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  const handleCreateTask = (taskData: Omit<Task, "taskId" | "createdAt">) => {
    const newTask: Task = {
      taskId: `task-${Date.now()}`,
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => [...prev, newTask]);
    closeAddTaskModal();
    toast.success(`Task "${taskData.title}" added successfully!`);
  };

  const handleInviteMembers = () => {
    console.log("Open invite members modal");
    toast("Invite members feature coming soon!", { icon: "ℹ️" });
  };

  const handleSaveWidgets = (selected: string[]) => {
    setVisibleWidgets(selected);
    closeCustomizeModal();
    toast.success("Dashboard updated!");
  };

  const handleUseTemplate = (data: TemplateData) => {
    // This part needs to be adjusted to the new Event type.
    // The TemplateData type from HEAD might be incompatible.
    // For now, I will keep it as is, but it might need further adjustments.
    setPrefillData({
      title: data.title,
      location: data.location || "",
      description: data.eventDescription || "",
      coverImageUri: data.coverImage,
      color: 0, // color is a number in the new type
      startAt: data.date,
      endAt: data.endDate,
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
        onInviteMembers={handleInviteMembers}
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
          tasks: [], // tasks are not part of the event anymore
          members: [], // members are strings
        }))}
        onClose={() => setIsTemplateModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}