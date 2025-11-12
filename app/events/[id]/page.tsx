'use client';

import { useParams, useRouter } from "next/navigation";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useEventStore, UpdateEventInput } from "@/stores/useEventStore"; 
import type { TemplateData } from "@/components/events/SaveTemplateModal";
import { editEventSchema } from "@/schemas/editEventSchema";
import { z } from "zod";
import type { Event, UserLite, Task } from "@/lib/types";

type EditEventData = z.infer<typeof editEventSchema>;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { openEditEventModal, closeEditEventModal } = useUiStore();
  const { events, updateEvent } = useEventStore(); 

  const event = events.find((e) => e.eventId === id) || mockEvents.find((e) => e.eventId === id);

  if (!event) {
    return <p className="p-8 text-center text-muted-foreground">Event not found.</p>;
  }

  // use mock user for now, replace with actual current user from auth later
  const currentUser: UserLite = {
    userId: "user-1",
    username: "Bob",
    email: "bob@example.com",
  };

  // Handlers
  const handleBack = () => router.back();

  const handleTaskStatusChange = (taskId: string, newStatus: "To Do" | "In Progress" | "Done") => {
    console.log("✅ Task status changed:", taskId, "→", newStatus);
  };

  const handleAddTask = (task: Omit<Task, "taskId" | "createdAt">) => {
    console.log("➕ Add new task:", task);
  };

  const handleEditEvent = (eventId: string) => {
    openEditEventModal(eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log("🗑️ Delete event:", eventId);
  };

  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    console.log("💾 Save as template for event:", eventId, templateData);
  };

  const handleUpdateEvent = (eventId: string, updatedData: UpdateEventInput) => {
    const normalizedData = {
      title: updatedData.title ?? "",
      location: updatedData.location,
      description: updatedData.description ?? "",
      coverImageUri: updatedData.coverImageUri ?? "",
      color: updatedData.color,
      startAt: updatedData.startAt ?? "",
      endAt: updatedData.endAt ?? "",
      members: (updatedData.members || []).map((m) => ({
        userId: m.userId,
        eventId: m.eventId ?? eventId,
        joinedAt: m.joinedAt ?? new Date().toISOString(),
        eventMemberId: m.eventMemberId,
      })),
    };

    updateEvent(eventId, normalizedData); 
    closeEditEventModal();
  };


  return (
    <div className="p-0">
      <EventDetail
        event={event}
        tasks={mockTasks}
        currentUser={currentUser}
        onBack={handleBack}
        onTaskStatusChange={handleTaskStatusChange}
        onAddTask={handleAddTask}
        onDeleteEvent={handleDeleteEvent}
        onSaveTemplate={handleSaveTemplate}
        onEditEvent={handleEditEvent}
      />

      <EditEventModal
        events={events.length > 0 ? events : mockEvents}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
}
