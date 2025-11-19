"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import { useEventStore, useSaveTemplate } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/task-store";
import { TemplateData } from "@/schemas/template";
import type { Event, UserLite, Task, TaskStatus } from "@/lib/types";
import { toast } from "react-hot-toast";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { openEditEventModal } = useUiStore();
  const { events, deleteEvent } = useEventStore();
  const { tasks, addTask, updateTask } = useTaskStore();

  const { mutate: saveTemplateMutate } = useSaveTemplate();

  const [currentUser, setCurrentUser] = useState<UserLite | null>(null);

  // Get event from store
  const event: Event | undefined = events.find((e) => e.eventId === id);

  // Fetch current user from API
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        if (data.items && data.items.length > 0) setCurrentUser(data.items[0]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load current user");
      }
    }
    fetchUser();
  }, []);

  if (!event) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Event not found.
      </p>
    );
  }

  if (!currentUser) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Loading user...
      </p>
    );
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
    deleteEvent(eventId);
  };

  const handleSaveTemplate = (eventId: string, templateData: TemplateData) => {
    if (!eventId) {
      toast.error("Cannot save template: Event ID is missing.");
      return;
    }
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

      <EditEventModal events={events} />
    </div>
  );
}
