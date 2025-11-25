// components/tasks/task-detail-sections/TaskDetailSubtasks.tsx
import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Subtask } from '@/lib/types';

interface TaskDetailSubtasksProps {
  subtasks: Subtask[] | undefined;
}

export const TaskDetailSubtasks: React.FC<TaskDetailSubtasksProps> = ({ subtasks }) => {
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <CheckSquare className="w-4 h-4" />
        <h3>Sub-tasks</h3>
      </div>
      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
        {subtasks.map((subtask) => (
          <div key={subtask.subtaskId} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={subtask.subtaskStatus === 'Done'}
              readOnly
              disabled
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className={`text-sm ${subtask.subtaskStatus === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
