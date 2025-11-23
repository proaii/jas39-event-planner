'use client';

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useDashboardUiStore } from "@/stores/dashboard-ui-store";

// ---- Mock activity data ----
const MOCK_ACTIVITIES = [
  { user: "Alice Johnson", action: "created a task", item: "Design Homepage", time: "2h ago" },
  { user: "Bob Smith", action: "completed a task", item: "Fix login bug", time: "5h ago" },
  { user: "Charlie Lee", action: "commented on a task", item: "Update API docs", time: "1d ago" },
];

export function RecentActivityWidget() {
  const { isLoading, error, setLoading, setError } = useDashboardUiStore();

  // ---- simulate loading state ----
  React.useEffect(() => {
    setLoading(false); // ไม่มี loading จริง
    setError(null);    // ไม่มี error จริง
  }, [setLoading, setError]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading recent activity...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  const activities = MOCK_ACTIVITIES;

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

          {activities.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
