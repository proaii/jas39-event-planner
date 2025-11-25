"use client";

import { useParams, useRouter } from "next/navigation";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { 
  useSaveTemplate, 
  useEventById, 
  useDeleteEvent,
} from "@/stores/useEventStore";
import { 
  useFetchEventTasks,
  useFetchAllTasks,
  useCreateEventTask,
  useEditTask,
  useDeleteTask,
} from "@/lib/client/features/tasks/hooks";
import type { Task, TaskStatus } from "@/lib/types";
import type { InfiniteData } from '@tanstack/react-query';
import { toast } from "react-hot-toast";
import { useFetchUsers, useFetchCurrentUser } from "@/lib/client/features/users/hooks";
import { useEffect } from "react";
import { getRealtimeChannel } from "@/lib/realtime";
// import { listAllUserTasks } from "@/lib/server/features/tasks/api";

import { useQueryClient } from "@tanstack/react-query";  // ⬅ เพิ่ม
import { queryKeys } from "@/lib/queryKeys";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // --- Convert id to string safely ---
  const eventId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null;

  // --- UI Store (UI State Only) ---
  const { openEditEventModal } = useUiStore();

  // --- React Query: Event Data ---
  const { 
    data: event, 
    isLoading: isEventLoading, 
    isError: isEventError 
  } = useEventById(eventId);

  // --- React Query: Tasks Data (using infinite query) ---
  const { 
    data: tasksData,
    isLoading: isTasksLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchEventTasks({
    eventId: eventId!,
  });

  // Flatten all pages safely
  const tasks: Task[] = tasksData ? tasksData.items : [];

const queryClient = useQueryClient();

// หลังจากรู้ eventId แล้ว ค่อย subscribe
useEffect(() => {
  if (!eventId) return;

  // คำนวณ key เดียวกันกับตอนใช้ useFetchEventTasks
  const tasksKey = queryKeys.tasks({
    eventId,
    status: undefined,
    pageSize: 20,   // ให้ตรงกับ default ใน hook
    q: undefined,
  });

  const unsubscribe = getRealtimeChannel("tasks", {
    eventId,
    onChange: ({ eventType, new: newRow, old }) => {
      console.log("TASKS realtime:", eventType, { newRow, old });

      // วิธีง่ายสุด: invalidate query → React Query refetch เอง
      queryClient.invalidateQueries({ queryKey: tasksKey });

      // ถ้ามีหน้า All Tasks ด้วยก็ invalidate รวมไปด้วย
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks({}), // All Tasks page
      });
    },
  });

  return () => {
    unsubscribe();
  };
}, [eventId, queryClient]);


  // --- React Query: Auth & Users ---
  const { 
    data: currentUser, 
    isLoading: isCurrentUserLoading 
  } = useFetchCurrentUser();

  const { 
    data: allUsers = [], 
    isLoading: isUsersLoading 
  } = useFetchUsers({
    enabled: true,
  });

  // --- Mutations ---
  const createTaskMutation = useCreateEventTask(eventId || "");
  const editTaskMutation = useEditTask();
  const deleteTaskMutation = useDeleteTask();
  const deleteEventMutation = useDeleteEvent();
  const { mutate: saveTemplateMutate } = useSaveTemplate();

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

  // Combined loading state
  const isLoading = isEventLoading || isTasksLoading || isCurrentUserLoading || isUsersLoading;

  if (isLoading) {
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

  if (isEventError || !event) {
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
    editTaskMutation.mutate(
      { 
        taskId, 
        patch: { taskStatus: newStatus } 
      },
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

  const handleAddTask = (taskInput: Omit<Task, "taskId" | "eventId" | "eventTitle" | "createdAt">) => {
    // useCreateEventTask expects Omit<Task, "taskId" | "eventTitle">
    // So we need to add back eventId and createdAt will be handled by API
    const taskPayload: Omit<Task, "taskId" | "eventTitle"> = {
      ...taskInput,
      eventId: event.eventId,
      createdAt: new Date().toISOString(), // Temporary, API will override
    };

    createTaskMutation.mutate(
      taskPayload,
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

  const handleSaveTemplate = (eventId: string, templateData: any) => {
    // Convert EventTemplateData to the expected format
    const payload = {
      name: event.title, // Use event title as template name
      title: templateData.title || event.title,
      description: templateData.eventDescription || event.description,
      location: templateData.location || event.location,
      eventDescription: templateData.eventDescription || event.description,
      coverImageUri: templateData.coverImageUri || event.coverImageUri,
      color: templateData.color ?? event.color,
      startAt: templateData.startAt || event.startAt,
      endAt: templateData.endAt || event.endAt,
      members: templateData.members || event.members || [],
    };

    saveTemplateMutate(
      { eventId, data: payload },
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
        tasks={tasks}
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