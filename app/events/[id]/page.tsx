"use client";

import { useParams, useRouter } from "next/navigation";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { 
  useFetchEvent, 
  useDeleteEvent,
} from "@/lib/client/features/events/hooks";
import { useSaveTemplate } from "@/lib/client/features/templates/hooks"; // Import from features
import { 
  useFetchEventTasks, 
  useCreateEventTask,
  useUpdateTaskStatus, // Assuming this hook exists or will be created
} from "@/lib/client/features/tasks/hooks"; // Import from features
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
  
  // --- Event Data (React Query) ---
  const { data: event, isLoading: isEventLoading, isError: isEventError } = useFetchEvent(eventId, { enabled: !!eventId });

  // --- Tasks Data (React Query) ---
  const { data: eventTasksData, isLoading: areTasksLoading, isError: areTasksError } = useFetchEventTasks({ eventId, enabled: !!eventId });
  const eventTasks = eventTasksData || [];

  // --- Mutations ---
  const saveTemplateMutate = useSaveTemplate(); // Destructure mutate directly in useSaveTemplate
  const deleteEventMutation = useDeleteEvent();
  const createEventTaskMutation = useCreateEventTask(eventId); // For adding tasks
  const updateTaskStatusMutation = useUpdateTaskStatus(); // For updating task status

  // --- Auth & Users ---
  const { 
    data: currentUser, 
    isLoading: isCurrentUserLoading 
  } = useFetchCurrentUser();

  const { data: allUsers = [], isLoading: isUsersLoading } = useFetchUsers({
    enabled: true,
  });

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

  if (isCurrentUserLoading || isUsersLoading || isEventLoading || areTasksLoading) {
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

  if (isEventError || areTasksError || !event || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-destructive">
            {isEventError || areTasksError ? "Error loading event details." : "Event not found or user data missing."}
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
    updateTaskStatusMutation.mutate(
      { taskId, patch: { taskStatus: newStatus } },
      {
        onSuccess: () => {
          toast.success("Task status updated");
        },
        onError: (error) => {
          console.error("Failed to update task status:", error);
          toast.error("Failed to update task status");
        },
      }
    );
  };

  const handleAddTask = (task: Omit<Task, "taskId" | "createdAt" | "eventTitle">) => {
    createEventTaskMutation.mutate(
      { ...task, eventId: event.eventId }, // Ensure eventId is passed to the mutation
      {
        onSuccess: () => {
          toast.success("Task added successfully");
        },
        onError: (error) => {
          console.error("Failed to add task:", error);
          toast.error("Failed to add task");
        },
      }
    );
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
    saveTemplateMutate.mutate(
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

      <EditEventModal event={event} />
    </div>
  );
}