// components/tasks/task-detail-sections/TaskDetailDates.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { formatFullDate } from '@/lib/utils';

interface TaskDetailDatesProps {
  startAt: string | null | undefined;
  endAt: string | null | undefined;
}

export const TaskDetailDates: React.FC<TaskDetailDatesProps> = ({ startAt, endAt }) => {
  return (
    <>
      {/* Due Date */}
      {endAt && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <h3>Due Date</h3>
          </div>
          <p className="text-sm">
            {formatFullDate(endAt)}
          </p>
        </div>
      )}

      {/* Start Date (if exists) */}
      {startAt && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <h3>Start Date</h3>
          </div>
          <p className="text-sm">
            {formatFullDate(startAt)}
          </p>
        </div>
      )}
    </>
  );
};
