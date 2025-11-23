'use client';

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useDashboardUiStore } from "@/stores/dashboard-ui-store";
import { useFetchRecentActivity } from "@/lib/client/features/activities/hooks";

interface RecentActivityWidgetProps {
  eventId: string;
}

export function RecentActivityWidget({ eventId }: RecentActivityWidgetProps) {
  const { isLoading: storeLoading, setLoading, error: storeError, setError } = useDashboardUiStore();

  // Fetch activities using React Query hook
  const { data: activities = [], isLoading, isError, error } = useFetchRecentActivity(eventId);

  // Sync Zustand UI state
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

  if (storeLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading recent activity...
        </CardContent>
      </Card>
    );
  }

  if (storeError) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-red-500">
          {storeError}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          No recent activity
        </CardContent>
      </Card>
    );
  }

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
