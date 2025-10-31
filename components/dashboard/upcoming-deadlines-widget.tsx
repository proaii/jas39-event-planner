import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { formatDate, getEffectiveDueDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface UpcomingDeadlinesWidgetProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function UpcomingDeadlinesWidget({ tasks, onTaskClick }: UpcomingDeadlinesWidgetProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = tasks
    .filter((task) => {
      const effectiveDue = getEffectiveDueDate(task);
      if (!effectiveDue) return false;

      const dueDate = new Date(effectiveDue);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(getEffectiveDueDate(a) ?? 0).getTime();
      const dateB = new Date(getEffectiveDueDate(b) ?? 0).getTime();
      return dateA - dateB;
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
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onTaskClick?.(task.id)}
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {task.priority?.[0] ?? "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(getEffectiveDueDate(task) || "")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No upcoming deadlines
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
