'use client'

import React, { useEffect } from 'react'
import { UserLite } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar, User, Flag, FileText, Paperclip, CheckSquare } from 'lucide-react'
import { priorityColorMap, statusColorMap } from '@/lib/constants'
import { useFetchTask } from '@/lib/client/features/tasks/hooks'
import { toast } from 'sonner'
import { formatFullDate, formatDateTime } from '@/lib/utils';
import { TaskDetailSkeleton } from './TaskDetailSkeleton';
import { TaskDetailStatus } from './task-detail-sections/TaskDetailStatus';
import { TaskDetailPriority } from './task-detail-sections/TaskDetailPriority';
import { TaskDetailDates } from './task-detail-sections/TaskDetailDates';
import { TaskDetailDescription } from './task-detail-sections/TaskDetailDescription';
import { TaskDetailAssignees } from './task-detail-sections/TaskDetailAssignees';
import { TaskDetailSubtasks } from './task-detail-sections/TaskDetailSubtasks';
import { TaskDetailAttachments } from './task-detail-sections/TaskDetailAttachments';
import { TaskDetailEventInfo } from './task-detail-sections/TaskDetailEventInfo';

interface TaskDetailProps {
  taskId: string
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  // API hook
  const { data: task, isLoading, isError, error } = useFetchTask(taskId)

  // Loading skeleton
  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  // Error state
  if (isError || !task) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg">Failed to load task</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message || 'An error occurred while loading the task details'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            <span>{task.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TaskDetailStatus taskStatus={task.taskStatus} />

          <TaskDetailPriority taskPriority={task.taskPriority} />

          <TaskDetailDates startAt={task.startAt} endAt={task.endAt} />

          <TaskDetailDescription description={task.description} />

          <TaskDetailAssignees assignees={task.assignees} />

          <TaskDetailSubtasks subtasks={task.subtasks} />

          <TaskDetailAttachments attachments={task.attachments} />

          <TaskDetailEventInfo eventId={task.eventId} eventTitle={task.eventTitle} />

          {/* Created Date */}
          {task.createdAt && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <h3>Created</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(task.createdAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}