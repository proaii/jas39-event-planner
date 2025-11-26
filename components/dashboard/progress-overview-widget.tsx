'use client';

import { Card, CardContent } from "@/components/ui/card";
import type { Event, Task } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface ProgressOverviewWidgetProps {
  events: Event[];
  tasks: Task[];
  onEventClick?: (eventId: string) => void;
}

function calcEventProgress(eventId: string, tasks: Task[]) {
  const related = tasks.filter(t => t.eventId === eventId);
  const total = related.length;
  const done = related.filter(t => t.taskStatus === "Done").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, progress };
}

export function ProgressOverviewWidget({
  events,
  tasks,
  onEventClick,
}: ProgressOverviewWidgetProps) {

  const top = events.slice(0, 3).map(ev => {
    const { total, done, progress } = calcEventProgress(ev.eventId, tasks);
    return { ev, total, done, progress };
  });

  if (!events.length) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No events to track
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Progress Overview</h3>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {top.map(({ ev, progress, total, done }) => (
            <div
              key={ev.eventId}
              className="space-y-2 cursor-pointer"
              onClick={() => onEventClick?.(ev.eventId)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate">
                  {ev.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {done}/{total} • {progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
