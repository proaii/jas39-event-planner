'use client'

import React, { useEffect } from 'react'
import { UserLite } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar, User, Flag, FileText, Paperclip, CheckSquare } from 'lucide-react'
import { priorityColorMap, statusColorMap } from '@/lib/constants'
import { useFetchTask } from '@/lib/client/features/tasks/hooks'
import { useTasksStore } from "@/stores/task-store"
import { toast } from 'sonner'

interface TaskDetailProps {
  taskId: string
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  // Zustand store
  const { setDetailLoading, setDetailError, clearDetailError } = useTasksStore()

  // API hook
  const { data: task, isLoading, isError, error } = useFetchTask(taskId)

  // Sync loading state with store
  useEffect(() => {
    setDetailLoading(isLoading)
  }, [isLoading, setDetailLoading])

  // Handle error
  useEffect(() => {
    if (isError && error) {
      const errorMsg = error?.message || 'Failed to load task details'
      setDetailError(errorMsg)
      toast.error(errorMsg)
    } else {
      clearDetailError()
    }
  }, [isError, error, setDetailError, clearDetailError])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
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
          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <Flag className="w-4 h-4" />
              <h3>Status</h3>
            </div>
            <Badge className={statusColorMap[task.taskStatus]}>{task.taskStatus}</Badge>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <Flag className="w-4 h-4" />
              <h3>Priority</h3>
            </div>
            <Badge className={priorityColorMap[task.taskPriority]}>{task.taskPriority}</Badge>
          </div>

          {/* Due Date */}
          {task.endAt && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <h3>Due Date</h3>
              </div>
              <p className="text-sm">
                {new Date(task.endAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Start Date (if exists) */}
          {task.startAt && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <h3>Start Date</h3>
              </div>
              <p className="text-sm">
                {new Date(task.startAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <FileText className="w-4 h-4" />
                <h3>Description</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Assignees */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <User className="w-4 h-4" />
              <h3>Assignees</h3>
            </div>
            {task.assignees && task.assignees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((assignee: UserLite) => (
                  <Badge key={assignee.userId} variant="secondary">
                    {assignee.username}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assignees</p>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <CheckSquare className="w-4 h-4" />
                <h3>Sub-tasks</h3>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {task.subtasks.map((subtask) => (
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
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <h3>Attachments</h3>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.attachmentId}
                    href={attachment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary hover:underline truncate">
                      {attachment.attachmentUrl}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Event Info (if exists) */}
          {task.eventId && task.eventTitle && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <h3>Event</h3>
              </div>
              <Badge variant="outline">{task.eventTitle}</Badge>
            </div>
          )}

          {/* Created Date */}
          {task.createdAt && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <h3>Created</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}