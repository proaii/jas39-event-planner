'use client';
import { useState } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { CustomizeDashboardModal } from "@/components/dashboard/CustomizeDashboardModal";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { toast } from "react-hot-toast";
import { Event, Task } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = "Bob";
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [personalTasks, setPersonalTasks] = useState<Task[]>(mockTasks);


  const defaultWidgets = [
    "upcomingEvents",
    "recentActivity",
    "upcomingDeadlines",
    "progressOverview",
  ];

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(defaultWidgets);

  // --- Event handlers ---
  const handleOpenAddEventModal = () => setIsAddEventModalOpen(true);
  const handleCloseAddEventModal = () => setIsAddEventModalOpen(false);

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
    setIsAddEventModalOpen(false);
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  const handleInviteMembers = () =>
    toast("Invite members feature coming soon!", { icon: "ℹ️" });

  const handleOpenAddTaskModal = () => setIsAddTaskModalOpen(true);
  const handleCloseAddTaskModal = () => setIsAddTaskModalOpen(false);

  const handleCreateTask = (
    taskData: Omit<Task, "id" | "status" | "createdAt">
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: "To Do",
      createdAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => [...prev, newTask]);
    setIsAddTaskModalOpen(false);
    toast.success(`Task "${taskData.title}" added successfully!`);
  };

  // --- Customize dashboard handlers ---
  const handleOpenCustomizeModal = () => setIsCustomizeModalOpen(true);
  const handleCloseCustomizeModal = () => setIsCustomizeModalOpen(false);

  const handleSaveWidgets = (selected: string[]) => {
    setVisibleWidgets(selected);
    setIsCustomizeModalOpen(false);
    toast.success("Dashboard updated!");
  };

  const handleResetWidgets = () => {
    setVisibleWidgets(defaultWidgets);
    toast.success("Dashboard reset to default!");
  };

  return (
    <>
      <Dashboard
        events={events}
        personalTasks={personalTasks}
        currentUser={currentUser}
        onCreateEvent={handleOpenAddEventModal}
        onEventClick={(id) => console.log("Event clicked:", id)}
        onCreatePersonalTask={handleOpenAddTaskModal}
        onCustomize={handleOpenCustomizeModal} 
        visibleWidgets={visibleWidgets} 
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={handleCloseAddEventModal}
        onCreateEvent={handleCreateEvent}
        onInviteMembers={handleInviteMembers}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={handleCloseAddTaskModal}
        onCreateTask={handleCreateTask}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal={true}
      />

      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={handleCloseCustomizeModal}
        selectedWidgets={visibleWidgets}
        onSave={handleSaveWidgets}
        onResetDefault={handleResetWidgets} 
      />
    </>
  );
}
