'use client';
import { useState } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { toast } from "react-hot-toast";
import { Event, Task } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = "Bob";
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [personalTasks, setPersonalTasks] = useState<Task[]>(mockTasks);

  const handleOpenAddEventModal = () => setIsAddEventModalOpen(true);
  const handleCloseAddEventModal = () => setIsAddEventModalOpen(false);

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'progress' | 'tasks' | 'createdAt' | 'ownerId'>) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ...eventData,
      progress: 0,
      tasks: [],
      createdAt: new Date().toISOString(),
      ownerId: currentUser,
    };
    setEvents(prev => [...prev, newEvent]);
    setIsAddEventModalOpen(false);
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  const handleInviteMembers = () => toast("Invite members feature coming soon!", { icon: "ℹ️" });

  const handleOpenAddTaskModal = () => setIsAddTaskModalOpen(true);
  const handleCloseAddTaskModal = () => setIsAddTaskModalOpen(false);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: "To Do",
      createdAt: new Date().toISOString(),
    };
    setPersonalTasks(prev => [...prev, newTask]);
    setIsAddTaskModalOpen(false);
    toast.success(`Task "${taskData.title}" added successfully!`);
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
    </>
  );
}
