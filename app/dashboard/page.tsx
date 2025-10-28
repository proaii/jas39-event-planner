'use client';
import { useState } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { AddEventModal } from "@/components/events/AddEventModal";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { toast } from "react-hot-toast";
import { Event, Task } from "@/lib/types"; 

export default function DashboardPage() {
  const currentUser = "Bob"; 
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);

  // Handler to open the Add Event Modal
  const handleOpenAddEventModal = () => setIsAddEventModalOpen(true);

  // Handler to close the Add Event Modal
  const handleCloseAddEventModal = () => setIsAddEventModalOpen(false);

  // Handler to create a new event
  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'progress' | 'tasks' | 'createdAt' | 'ownerId'>) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ...eventData,
      progress: 0,
      tasks: [] as Task[],
      createdAt: new Date().toISOString(),
      ownerId: currentUser,
    };

    // Add new event to events state
    setEvents((prev) => [...prev, newEvent]);
    
    // Close modal after successful creation
    setIsAddEventModalOpen(false);
    
    // Show success notification
    toast.success(`Event "${eventData.title}" created successfully!`);
  };

  // Handler to open invite members modal (to be implemented)
  const handleInviteMembers = () => {
    console.log("Open invite members modal");
    toast("Invite members feature coming soon!", { icon: "ℹ️" });
  };

  return (
    <>
      <Dashboard
        events={events}
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
        currentUserId={currentUser}
      />
    </>
  );
}
