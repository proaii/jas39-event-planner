import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { formatDueDate } from "@/lib/utils";
import { getEffectiveDueDate } from "@/lib/supabase/utils";
import { Clock } from "lucide-react";

interface UpcomingDeadlinesWidgetProps {
  tasks: Task[];
}

export function UpcomingDeadlinesWidget({ tasks }: UpcomingDeadlinesWidgetProps) {
  const upcomingTasks = tasks
    .filter(task => {
      const effectiveDueDate = getEffectiveDueDate(task);
      if (!effectiveDueDate || task.status === 'Done') return false;

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
            const effectiveDueDate = getEffectiveDueDate(task);
            const dueInfo = formatDueDate(effectiveDueDate);
            return (
              <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'Urgent' ? 'bg-red-500' :
                  task.priority === 'High' ? 'bg-orange-500' :
                  task.priority === 'Normal' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.eventTitle || 'Personal'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${dueInfo?.isUrgent ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                    {dueInfo?.isToday ? 'Today' : dueInfo?.isTomorrow ? 'Tomorrow' :
                     new Date(effectiveDueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
