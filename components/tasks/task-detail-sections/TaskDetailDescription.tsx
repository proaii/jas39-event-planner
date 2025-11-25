// components/tasks/task-detail-sections/TaskDetailDescription.tsx
import React from 'react';
import { FileText } from 'lucide-react';

interface TaskDetailDescriptionProps {
  description: string | undefined;
}

export const TaskDetailDescription: React.FC<TaskDetailDescriptionProps> = ({ description }) => {
  if (!description) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <FileText className="w-4 h-4" />
        <h3>Description</h3>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
    </div>
  );
};
