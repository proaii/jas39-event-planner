'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Activity } from "lucide-react";

export function RecentActivityWidget() {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {[
            { user: "Sarah Chen", action: "completed", item: "Invite speakers", time: "2h ago" },
            { user: "Michael Brown", action: "was assigned to", item: "Setup registration", time: "4h ago" },
            { user: "Emily Davis", action: "commented on", item: "Hackathon 2025", time: "1d ago" },
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(activity.user)}</AvatarFallback>
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
