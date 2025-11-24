"use client";

import { useParams, useRouter } from "next/navigation";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useTasksStore } from "@/stores/task-store"
import { 
  useSaveTemplate, 
  useEventById, 
  useDeleteEvent,
} from "@/stores/useEventStore";
import { TemplateData } from "@/schemas/template";
import type { Task, TaskStatus } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useFetchUsers, useFetchCurrentUser } from "@/lib/client/features/users/hooks";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // --- Convert id to string safely ---
  const eventId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null;

  // --- UI Store ---
  const { openEditEventModal } = useUiStore();
  
  // --- Tasks Store ---
  const { 
    addTask, 
    updateTaskStatus: updateTaskStatusInStore,
    getTasksByEventId,
  } = useTasksStore();
  
  // --- Mutations ---
  const { mutate: saveTemplateMutate, isPending: isSavingTemplate } = useSaveTemplate();
  const deleteEventMutation = useDeleteEvent();

  // --- Auth & Users ---
  const { 
    data: currentUser, 
    isLoading: isCurrentUserLoading 
  } = useFetchCurrentUser();

  const { data: allUsers = [], isLoading: isUsersLoading } = useFetchUsers({
    enabled: true,
  });

  // --- Event Data ---
  const event = useEventById(eventId);

  // --- Get tasks for this event ---
  const eventTasks = eventId ? getTasksByEventId(eventId) : [];

  // --- Loading & Error States ---
  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-center text-muted-foreground">
          Event ID missing
        </p>
      </div>
    );
  }

  if (isCurrentUserLoading || isUsersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-center text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-center text-muted-foreground">
          Unable to load user data
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            Event not found
          </p>
          <button
            onClick={() => router.push("/events")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleBack = () => {
    router.back();
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    try {
      updateTaskStatusInStore(taskId, newStatus);
      toast.success("Task status updated");
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleAddTask = (task: Omit<Task, "taskId" | "createdAt">) => {
    try {
      addTask({
        ...task,
        eventId: event.eventId,
        eventTitle: event.title,
      });
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleEditEvent = (eventId: string) => {
    openEditEventModal(eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        toast.success("Event deleted successfully");
        router.push("/events");
      },
      onError: (error) => {
        console.error("Failed to delete event:", error);
        toast.error("Failed to delete event");
      },
    });
  };

  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    saveTemplateMutate(
      { eventId, data: templateData },
      {
        onSuccess: () => {
          toast.success("Template saved successfully");
        },
        onError: (error) => {
          console.error("Failed to save template:", error);
          toast.error("Failed to save template");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
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