import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface ProgressOverviewWidgetProps {
  events: Event[];
}

export function ProgressOverviewWidget({ events }: ProgressOverviewWidgetProps) {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Progress Overview</h3>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate">{event.title}</span>
                <span className="text-sm text-muted-foreground">{event.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No events to track
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
