// components/tasks/task-detail-sections/TaskDetailStatus.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flag } from 'lucide-react';
import { statusColorMap } from '@/lib/constants';
import { TaskStatus } from '@/lib/types';

interface TaskDetailStatusProps {
  taskStatus: TaskStatus;
}

export const TaskDetailStatus: React.FC<TaskDetailStatusProps> = ({ taskStatus }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <Flag className="w-4 h-4" />
        <h3>Status</h3>
      </div>
      <Badge className={statusColorMap[taskStatus]}>{taskStatus}</Badge>
    </div>
  );
};
