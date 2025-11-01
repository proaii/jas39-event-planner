"use client";

import { useParams, useRouter } from "next/navigation";
import { mockEvents } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";
import { EditEventModal } from "@/components/events/EditEventModal";
import { useUiStore } from "@/stores/ui-store";
import type { Task } from "@/lib/types";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);
  const { isEditEventModalOpen, openEditEventModal, closeEditEventModal } = useUiStore();

  if (!event) {
    return <p className="p-8 text-center text-muted-foreground">Event not found.</p>;
  }

  // ---- Handlers ----
  const handleBack = () => router.back();

  const handleTaskStatusChange = (taskId: string, newStatus: "To Do" | "In Progress" | "Done") => {
    console.log("✅ Task status changed:", taskId, "→", newStatus);
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    console.log("➕ Add new task:", task);
  };

  const handleEditEvent = (eventId: string) => {
    openEditEventModal(eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log("🗑️ Delete event:", eventId);
  };

  const handleSaveTemplate = (eventId: string, templateData: any) => {
    console.log("💾 Save as template for event:", eventId, templateData);
  };

  const handleUpdateEvent = (eventId: string, updatedData: any) => {
    console.log("✏️ Updated event:", eventId, updatedData);
    closeEditEventModal();
  };

  return (
    <div className="p-0">
      {/* Event Detail View */}
      <EventDetail
        event={event}
        currentUser="Bob"
        onBack={handleBack}
        onTaskStatusChange={handleTaskStatusChange}
        onAddTask={handleAddTask}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={closeEditEventModal}
        events={mockEvents}
        onUpdateEvent={handleUpdateEvent}
        onInviteMembers={() => console.log("👥 Invite members clicked")}
      />
    </div>
  );
}
