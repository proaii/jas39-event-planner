"use client";

import { useParams } from "next/navigation";
import { mockEvents } from "@/lib/mock-data";
import { EventDetail } from "@/components/events/EventDetail";

export default function EventDetailPage() {
  const { id } = useParams(); 
  const event = mockEvents.find((e) => e.id === id);

  if (!event) return <p className="p-8 text-center">Event not found.</p>;

  return (
    <div className="p-8">
      <EventDetail
        event={event}
        currentUser="Bob"
        onBack={() => history.back()}
        onTaskStatusChange={() => {}}
        onAddTask={() => {}}
      />
    </div>
  );
}
