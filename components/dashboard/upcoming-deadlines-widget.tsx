import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { formatDueDate } from "@/lib/utils";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingDeadlinesWidgetProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function UpcomingDeadlinesWidget({ tasks, onTaskClick }: UpcomingDeadlinesWidgetProps) {
  const upcomingTasks = tasks
    .map(task => ({
      ...task,
      effectiveDueDate:
        task.startDate && task.endDate
          ? task.endDate
          : task.dueDate || undefined,
    }))
    .filter(task => task.effectiveDueDate && task.status !== "Done")
    .sort((a, b) => new Date(a.effectiveDueDate!).getTime() - new Date(b.effectiveDueDate!).getTime())
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
            const dueInfo = formatDueDate(task.effectiveDueDate);
            const assignees = task.assignees || [];

            return (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task.id!)}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    task.priority === "Urgent"
                      ? "bg-red-500"
                      : task.priority === "High"
                      ? "bg-orange-500"
                      : task.priority === "Normal"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  )}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.isPersonal
                      ? "Personal"
                      : assignees.length
                      ? assignees.join(", ")
                      : "Unassigned"}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xs font-medium ${
                      dueInfo?.isUrgent ? "text-warning" : "text-muted-foreground"
                    }`}
                  >
                    {dueInfo?.isToday
                      ? "Today"
                      : dueInfo?.isTomorrow
                      ? "Tomorrow"
                      : task.effectiveDueDate
                      ? new Date(task.effectiveDueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            );
          })}

          {upcomingTasks.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No upcoming deadlines
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
