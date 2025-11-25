// components/tasks/task-detail-sections/TaskDetailPriority.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flag } from 'lucide-react';
import { priorityColorMap } from '@/lib/constants';
import { TaskPriority } from '@/lib/types';

interface TaskDetailPriorityProps { // Corrected interface name
  taskPriority: TaskPriority;
}

export const TaskDetailPriority: React.FC<TaskDetailPriorityProps> = ({ // Corrected component name
  taskPriority,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <Flag className="w-4 h-4" />
        <h3>Priority</h3>
      </div>
      <Badge className={priorityColorMap[taskPriority]}>{taskPriority}</Badge>
    </div>
  );
};