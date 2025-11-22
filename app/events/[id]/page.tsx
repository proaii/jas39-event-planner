"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useTaskStore } from "@/stores/task-store";
import { useSaveTemplate } from "@/stores/useEventStore";
import { TemplateData } from "@/schemas/template";
import type { Event, UserLite, Task, TaskStatus } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useFetchUsers } from "@/lib/client/features/users/hooks";
import { useFetchEvent, useDeleteEvent } from "@/lib/client/features/events/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // --- convert id to string safely ---
  const eventId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;
  if (!eventId) {
    return <p className="p-8 text-center text-muted-foreground">Event ID missing</p>;
  }

  const { openEditEventModal } = useUiStore();
  const { tasks, addTask, updateTask } = useTaskStore();
  const { mutate: saveTemplateMutate } = useSaveTemplate();
  const qc = useQueryClient();
  const { mutate: deleteEventMutate } = useDeleteEvent();

  const [currentUserId] = useState(""); 

  // ------------------- USERS -------------------
  const { data: users = [], isLoading: isUsersLoading } = useFetchUsers({
    q: currentUserId,
    enabled: true,
  });
  const currentUser: UserLite | null = users.length > 0 ? users[0] : null;

  // ------------------- EVENT -------------------
  const { data: event, isLoading: isEventLoading } = useFetchEvent(eventId);

  if (isEventLoading) {
    return <p className="p-8 text-center text-muted-foreground">Loading event...</p>;
  }

  if (!event) {
    return <p className="p-8 text-center text-muted-foreground">Event not found.</p>;
  }

  if (isUsersLoading || !currentUser) {
    return <p className="p-8 text-center text-muted-foreground">Loading user...</p>;
  }

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
    if (!eventId) return;
    deleteEventMutate(eventId, {
      onSuccess: () => {
        toast.success("Event deleted successfully!");
        router.push("/events");
      },
      onError: (error) => {
        toast.error(`Error deleting event: ${error.message}`);
      },
    });
  };

  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    saveTemplateMutate({ eventId, data: templateData });
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

      <EditEventModal events={[event]} />
    </div>
  );
}
