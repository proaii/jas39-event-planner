"use client";

import { useParams, useRouter } from "next/navigation";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useTaskStore } from "@/stores/task-store";
import { useSaveTemplate, useEventById, useDeleteEvent } from "@/stores/useEventStore";
import { TemplateData } from "@/schemas/template";
import type { Task, TaskStatus } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useFetchUsers, useFetchUser } from "@/lib/client/features/users/hooks";
import { useUser } from "@/lib/client/features/auth/hooks";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // --- convert id to string safely ---
  const eventId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null;

  const { openEditEventModal } = useUiStore();
  const { tasks, addTask, updateTask } = useTaskStore();
  const { mutate: saveTemplateMutate } = useSaveTemplate();
  const deleteEventMutation = useDeleteEvent();

  const { data: authUser } = useUser();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useFetchUser(
    authUser?.id ?? ""
  );

  // ------------------- USERS -------------------
  const { data: allUsers = [] } = useFetchUsers({
    enabled: true,
  });

  // ------------------- EVENT -------------------
  const event = useEventById(eventId);

  if (!eventId) {
    return <p className="p-8 text-center text-muted-foreground">Event ID missing</p>;
  }

  if (isCurrentUserLoading || !currentUser) {
    return <p className="p-8 text-center text-muted-foreground">Loading user...</p>;
  }

  if (!event) {
    return <p className="p-8 text-center text-muted-foreground">Event not found.</p>;
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
    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        toast.success("Event deleted successfully");
        router.push("/events");
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
        allUsers={allUsers}
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
