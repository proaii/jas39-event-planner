'use client';

import React, { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { useFetchRecentActivity } from "@/lib/client/features/activities/hooks";
import { useFetchEvents } from "@/lib/client/features/events/hooks";
import type { Event } from "@/lib/types";

export function RecentActivityWidget() {
  const { setLoading, setError } = useUiStore();

  // Fetch events to get first eventId
  const { data: eventsData } = useFetchEvents({});
  const events = useMemo(() => eventsData || [], [eventsData]);
  const firstEventId = events[0]?.eventId || "";

  // Fetch activities using first event
  const { data: activities = [], isLoading, isError, error } = useFetchRecentActivity(firstEventId);

  // Sync UI state
  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  React.useEffect(() => {
    if (isError) {
      setError(error instanceof Error ? error.message : 'Failed to load activities');
    } else {
      setError(null);
    }
  }, [isError, error, setError]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading recent activity...
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-red-500">
          {error instanceof Error ? error.message : 'Failed to load activities'}
        </CardContent>
      </Card>
    );
  }

  // No events (can't fetch activities)
  if (!firstEventId) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          No events to show activities for
        </CardContent>
      </Card>
    );
  }

  // No activities
  if (activities.length === 0) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          No recent activity
        </CardContent>
      </Card>
    );
  }

  // Render activities
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-medium">{activity.user.split(" ")[0]}</span> {activity.action}
                </p>
                <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}