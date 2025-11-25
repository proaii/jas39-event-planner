// components/tasks/task-detail-sections/TaskDetailEventInfo.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface TaskDetailEventInfoProps {
  eventId: string | null | undefined;
  eventTitle: string | undefined;
}

export const TaskDetailEventInfo: React.FC<TaskDetailEventInfoProps> = ({ eventId, eventTitle }) => {
  if (!eventId || !eventTitle) return null;

  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <h3>Event</h3>
      </div>
      <Badge variant="outline">{eventTitle}</Badge>
    </div>
  );
};
