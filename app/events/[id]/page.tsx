'use client';

import { useParams, useRouter } from "next/navigation";
import { mockEvents, mockTasks } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import type { Task, UserLite } from "@/lib/types";
import { type TemplateData } from "@/components/events/SaveTemplateModal";
import { editEventSchema } from "@/schemas/editEventSchema";
import { z } from "zod";

type EditEventData = z.infer<typeof editEventSchema>;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const event = mockEvents.find((e) => e.eventId === id);
  const { openEditEventModal, closeEditEventModal } = useUiStore();

  const currentUser: UserLite = {
    userId: "user-1",
    username: "Bob",
    email: "bob@example.com",
  };

  if (!event) {
    return <p className="p-8 text-center text-muted-foreground">Event not found.</p>;
  }

  // ---- Handlers ----
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

  const handleUpdateEvent = (eventId: string, updatedData: EditEventData) => {
    console.log("✏️ Updated event:", eventId, updatedData);
    closeEditEventModal();
  };

  return (
    <div className="p-0">
      {/* Event Detail View */}
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

      {/* Edit Event Modal */}
      <EditEventModal
        
        events={mockEvents}
        onUpdateEvent={handleUpdateEvent}
        onInviteMembers={() => console.log("👥 Invite members clicked")}
      />
    </div>
  );
}