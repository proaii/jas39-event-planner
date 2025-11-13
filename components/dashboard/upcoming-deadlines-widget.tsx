'use client';

import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/lib/types";
import { formatDueDate } from "@/lib/utils";
import { getEffectiveDueDate } from "@/lib/server/supabase/utils";
import { Clock } from "lucide-react";

interface UpcomingDeadlinesWidgetProps {
  tasks: Task[];
}

type Dateish = { startDate?: string; endDate?: string; dueDate?: string };
function effectiveDueDateOf(t: Task): string | undefined {
  const dateish: Dateish = {
    startDate: t.startAt ?? undefined,
    endDate: t.endAt ?? undefined,
    dueDate: t.endAt ?? undefined, 
  };
  return getEffectiveDueDate(dateish) ?? undefined;
}

export function UpcomingDeadlinesWidget({ tasks }: UpcomingDeadlinesWidgetProps) {
  const upcomingTasks = tasks
    .filter(task => {
      const effectiveDueDate = effectiveDueDateOf(task);
      if (!effectiveDueDate || task.taskStatus === "Done") return false;

      const dueDate = new Date(effectiveDueDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      nextWeek.setHours(23, 59, 59, 999);

      return dueDate >= today && dueDate <= nextWeek;
    })
    .slice(0, 3);

  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Upcoming Deadlines</h3>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {upcomingTasks.map(task => {
            const due = effectiveDueDateOf(task)!;
            const dueInfo = formatDueDate(due);
            return (
              <div
                key={task.taskId}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.taskPriority === "Urgent"
                      ? "bg-red-500"
                      : task.taskPriority === "High"
                      ? "bg-orange-500"
                      : task.taskPriority === "Normal"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.eventTitle
                      ? task.eventTitle
                      : task.eventId
                      ? "Event"
                      : "Personal"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${dueInfo?.isUrgent ? "text-warning font-medium" : "text-muted-foreground"}`}>
                    {dueInfo?.isToday
                      ? "Today"
                      : dueInfo?.isTomorrow
                      ? "Tomorrow"
                      : new Date(due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}

          {upcomingTasks.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">No upcoming deadlines</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}