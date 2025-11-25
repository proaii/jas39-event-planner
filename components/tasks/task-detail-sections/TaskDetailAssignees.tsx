// components/tasks/task-detail-sections/TaskDetailAssignees.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { UserLite } from '@/lib/types';

interface TaskDetailAssigneesProps {
  assignees: UserLite[] | undefined;
}

export const TaskDetailAssignees: React.FC<TaskDetailAssigneesProps> = ({ assignees }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <User className="w-4 h-4" />
        <h3>Assignees</h3>
      </div>
      {assignees && assignees.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {assignees.map((assignee: UserLite) => (
            <Badge key={assignee.userId} variant="secondary">
              {assignee.username}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No assignees</p>
      )}
    </div>
  );
};
