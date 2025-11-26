'use client';

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useFetchRecentActivities } from "@/lib/client/features/activities/hooks"; 
import type { ActivityItem } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export function RecentActivityWidget() {
  const { 
    data: activities = [], 
    isLoading, 
    isError, 
  } = useFetchRecentActivities();

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <Card className="lg:col-span-1 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Error or Empty State
  if (isError || !activities || activities.length === 0) {
    return (
      <Card className="lg:col-span-1 border-0 shadow-sm h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-60">
            <div className="bg-muted/50 p-3 rounded-full mb-3">
              <Activity className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Activities will appear here when your team starts working on tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Render Activities
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-6 relative">
          {}
          <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-border z-0" />

          {(activities as ActivityItem[]).slice(0, 3).map((activity, index) => (
            <div key={activity.id || index} className="flex items-start space-x-3 relative z-10">
              
              {/* Avatar */}
              <Avatar className="w-8 h-8 border-2 border-black">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-foreground leading-none mb-1">
                  <span className="font-semibold hover:underline cursor-pointer">
                    {activity.user}
                  </span>{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    {activity.action}
                  </span>
                </p>
                
                <p className="text-sm font-medium text-foreground/80 truncate">
                  {activity.item}
                </p>
                
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatTime(activity.time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}