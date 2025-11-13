"use client";

import { useParams, useRouter } from "next/navigation";
import { mockEvents } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useEventStore, UpdateEventInput, useSaveTemplate } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/task-store";
import { TemplateData } from "@/schemas/template";
import { z } from "zod";
import { editEventSchema } from "@/schemas/editEventSchema";
import type { Event, UserLite, Task, TaskStatus, EventMember } from "@/lib/types";
import { toast } from "react-hot-toast";

type EditEventData = z.infer<typeof editEventSchema>;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { openEditEventModal, closeEditEventModal } = useUiStore();
  const { events, updateEvent, deleteEvent } = useEventStore();
  const { tasks, addTask, updateTask } = useTaskStore();

  const { mutate: saveTemplateMutate } = useSaveTemplate();

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

  // Mock current user
  const currentUser: UserLite = {
    userId: "user-1",
    username: "Bob",
    email: "bob@example.com",
  };

  // --- Handlers ---

  const handleBack = () => router.back();

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { taskStatus: newStatus });
  };

  const handleAddTask = (task: Omit<Task, "taskId" | "createdAt">) => {
    addTask({ ...task, eventId: event.eventId, eventTitle: event.title });
  };

  const handleEditEvent = (eventId: string) => {
    openEditEventModal(eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    if (!eventId) {
      toast.error("Cannot save template: Event ID is missing.");
      return;
    }
    saveTemplateMutate({ eventId, data: templateData });
  };

  const handleUpdateEvent = (eventId: string, updatedData: Partial<UpdateEventInput>) => {
    // Normalize members
    const normalizedMembers: EventMember[] =
      (updatedData.members ?? []).map((m) => ({
        eventMemberId: m.eventMemberId ?? "",
        eventId: m.eventId ?? eventId,
        userId: m.userId,
        joinedAt: m.joinedAt ?? new Date().toISOString(),
        role: m.role,
      }));

    const normalizedData: Partial<UpdateEventInput> = {
      ...updatedData,
      members: normalizedMembers,
    };

    updateEvent(eventId, normalizedData);
    closeEditEventModal();
  };

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
      />
    </div>
  );
}
