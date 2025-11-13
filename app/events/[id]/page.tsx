"use client";

import { useParams, useRouter } from "next/navigation";
import { mockEvents } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useEventStore, UpdateEventInput } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/task-store";
import type { TemplateData } from "@/components/events/SaveTemplateModal";
import { editEventSchema } from "@/schemas/editEventSchema";
import { z } from "zod";
import type { Event, UserLite, Task, TaskStatus, EventMember } from "@/lib/types";

type EditEventData = z.infer<typeof editEventSchema>;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { openEditEventModal, closeEditEventModal } = useUiStore();
  const { events, updateEvent, deleteEvent, saveTemplate } = useEventStore();
  const { tasks, addTask, updateTask } = useTaskStore();

  
  // Get event from store or fallback to mock
  const event: Event | undefined =
    events.find((e) => e.eventId === id) ||
    mockEvents.find((e) => e.eventId === id);

  if (!event) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Event not found.
      </p>
    );
  }

  // Mock current user, replace with real auth later
  const currentUser: UserLite = {
    userId: "user-1",
    username: "Bob",
    email: "bob@example.com",
  };

  // --- Handlers ---

  // Navigate back
  const handleBack = () => router.back();

  // Update task status in TaskStore
  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { taskStatus: newStatus });
  };

  // Add a new task linked to this event
  const handleAddTask = (task: Omit<Task, "taskId" | "createdAt">) => {
    addTask({ ...task, eventId: event.eventId, eventTitle: event.title });
  };

  // Open edit event modal
  const handleEditEvent = (eventId: string) => {
    openEditEventModal(eventId);
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);  // เรียก action ของ store แทน console.log
  };

  // Save event as template
  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    saveTemplate(eventId, templateData); // เรียก action ของ store แทน console.log
  };

  // Update event in EventStore
  const handleUpdateEvent = (eventId: string, updatedData: UpdateEventInput) => {
    // Normalize data to match EventMember and UpdateEventInput types
    const normalizedData: UpdateEventInput = {
      title: updatedData.title ?? "",
      location: updatedData.location,
      description: updatedData.description ?? "",
      coverImageUri: updatedData.coverImageUri ?? "",
      color: updatedData.color,
      startAt: updatedData.startAt ?? null,
      endAt: updatedData.endAt ?? null,
      members: (updatedData.members || []).map((m: EventMember) => ({
        eventMemberId: m.eventMemberId,
        eventId: m.eventId ?? eventId,
        userId: m.userId,
        joinedAt: m.joinedAt ?? new Date().toISOString(),
        role: m.role, // optional field, matches schema
      })),
    };

    updateEvent(eventId, normalizedData);
    closeEditEventModal();
  };

  // Filter tasks belonging to this event
  const eventTasks = tasks.filter((t) => t.eventId === event.eventId);

  return (
    <div className="p-0">
      <EventDetail
        event={event}
        tasks={eventTasks}
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
