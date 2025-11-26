'use client';

import { useFetchCurrentUser } from "@/lib/client/features/users/hooks";
import { Button } from "@/components/ui/button";
import { Layout, Plus } from "lucide-react";

interface WelcomeHeaderProps {
  onCreateEvent: () => void;
  onOpenCustomizeDashboard?: () => void;
}

export function WelcomeHeader({
  onCreateEvent,
  onOpenCustomizeDashboard,
}: WelcomeHeaderProps) {
  const { data: currentUser, isLoading, isError } = useFetchCurrentUser();

  if (isLoading) return <p>Loading user...</p>;
  if (isError || !currentUser) return <p className="text-red-500">Failed to load user</p>;

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Welcome back, {currentUser.username.split(" ")[0]}! 👋
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCustomizeDashboard}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Layout className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>

        <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
          <Button
            onClick={onCreateEvent}
            className="bg-primary hover:bg-primary/90 rounded-r-none border-r border-primary-foreground/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
}
