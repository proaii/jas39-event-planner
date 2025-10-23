'use client';
import { Dashboard } from "@/components/dashboard/dashboard";
import { mockEvents, mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <Dashboard
      events={mockEvents}
      personalTasks={mockTasks}
      currentUser="Bob"
      onCreateEvent={() => {}}
      onEventClick={() => {}}
    />
  );
}