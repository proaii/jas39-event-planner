'use client';
import { useState } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { toast } from "react-hot-toast";
import type { Event } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = "Bob";
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);

  const handleOpenAddEventModal = () => setIsAddEventModalOpen(true);
  const handleCloseAddEventModal = () => setIsAddEventModalOpen(false);

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
    setIsAddEventModalOpen(false);
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  const handleInviteMembers = () => {
    console.log("Open invite members modal");
    toast("Invite members feature coming soon!", { icon: "ℹ️" });
  };

  return (
    <>
      <Dashboard
        events={events}
        tasks={mockTasks}        
        personalTasks={mockTasks}
        currentUser={currentUser}
        onCreateEvent={handleOpenAddEventModal}
        onEventClick={(eventId) => console.log("Event clicked:", eventId)}
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={handleCloseAddEventModal}
        onCreateEvent={handleCreateEvent}
        onInviteMembers={handleInviteMembers}
      />
    </>
  );
}
