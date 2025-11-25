'use client';

import React, { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useFetchRecentActivity } from "@/lib/client/features/activities/hooks";
import { useFetchEvents } from "@/stores/useEventStore";
import type { Event, ActivityItem } from "@/lib/types";

// ---- HELPER: flatten events ----
function flattenEventsData(data?: { pages?: { items: Event[] }[]; items?: Event[] }): Event[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (data.pages && Array.isArray(data.pages)) {
    return data.pages.flatMap(p => Array.isArray(p.items) ? p.items : []);
  }
  return [];
}

export function RecentActivityWidget() {
  // Fetch events to get first eventId
  const { data: eventsData, isLoading: eventsLoading } = useFetchEvents();
  const events = useMemo(() => flattenEventsData(eventsData), [eventsData]);
  const firstEventId = events[0]?.eventId || "";

  // Fetch activities - will handle empty eventId gracefully
  const { 
    data: activities = [], 
    isLoading: activitiesLoading, 
    isError: activitiesError, 
  } = useFetchRecentActivity(firstEventId || "");

  // Combined loading state
  const isLoading = eventsLoading || activitiesLoading;

  // Loading state
  if (isLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-2 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state - show friendly empty state instead of error
  if (activitiesError || !firstEventId) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No Recent Activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No activities
  if (!activities || activities.length === 0) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              ไม่มี Recent Activity
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity จะปรากฏเมื่อทีมเริ่มทำงานใน events
            </p>
          </div>
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
          {(activities as ActivityItem[]).slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-medium">{activity.user.split(" ")[0]}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.item}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}