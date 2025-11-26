'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AlertCircle, 
  Calendar, 
  User, 
  Flag, 
  FileText, 
  Paperclip, 
  CheckSquare, 
  Edit, 
  Trash2,
  Loader2 
} from 'lucide-react'
import { priorityColorMap, statusColorMap } from '@/lib/constants'
import { useFetchTask, useDeleteTask, useUpdateSubtaskStatus, useEditTask } from '@/lib/client/features/tasks/hooks'
import { useUiStore } from '@/stores/ui-store'
import { toast } from 'sonner'
import type { UserLite, TaskStatus } from '@/lib/types'
import { useState } from 'react'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string | null
}

export function TaskDetailModal({ isOpen, onClose, taskId }: TaskDetailModalProps) {
  const { openEditTaskModal } = useUiStore()

  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null)
  
  // Fetch task data
  const shouldFetch = taskId && taskId.trim().length > 0
  const { 
    data: task, 
    isLoading, 
    isError, 
    error 
  } = useFetchTask(shouldFetch ? taskId : 'skip-fetch')

  // Mutation
  const deleteTaskMutation = useDeleteTask()
  const updateSubtaskMutation = useUpdateSubtaskStatus()
  const editTaskMutation = useEditTask()

  // Handle edit
  const handleEdit = () => {
    if (!task) return
    onClose() // Close detail modal first
    setTimeout(() => {
      openEditTaskModal(task.taskId) // Then open edit modal
    }, 100)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!task) return
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      await deleteTaskMutation.mutateAsync({ taskId: task.taskId })
      toast.success('Task deleted successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete task')
    }
  }

  // Handle Subtask Status Toggle 
  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    if (updatingSubtaskId === subtaskId || !task || !task.subtasks) return

    const newSubtaskStatus = currentStatus === 'Done' ? 'To Do' : 'Done'
    
    setUpdatingSubtaskId(subtaskId) 
    
    try {
      await updateSubtaskMutation.mutateAsync({ 
        subtaskId, 
        status: newSubtaskStatus 
      })

      const updatedSubtasks = task.subtasks.map(sub => 
        sub.subtaskId === subtaskId ? { ...sub, subtaskStatus: newSubtaskStatus } : sub
      )

      const totalSubtasks = updatedSubtasks.length
      const doneCount = updatedSubtasks.filter(s => s.subtaskStatus === 'Done').length
      const inProgressCount = updatedSubtasks.filter(s => s.subtaskStatus === 'In Progress').length

      let newParentStatus: TaskStatus = 'To Do'

      if (totalSubtasks > 0) {
        if (doneCount === totalSubtasks) {
          newParentStatus = 'Done'
        } else if (doneCount > 0 || inProgressCount > 0) {
          newParentStatus = 'In Progress'
        } else {
          newParentStatus = 'To Do'
        }
      }

      if (newParentStatus !== task.taskStatus) {
        await editTaskMutation.mutateAsync({
          taskId: task.taskId,
          patch: { taskStatus: newParentStatus }
        })
        toast.success(`Task updated to ${newParentStatus}`)
      }

    } catch { 
      toast.error('Failed to update subtask')
    } finally {
      setUpdatingSubtaskId(null) 
    }
  }

  if (!isOpen || !shouldFetch) {
    return null
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (isError || !task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Error Loading Task</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                {error?.message || 'Failed to load task details'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <CheckSquare className="w-6 h-6 text-primary" />
            <span>{task.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Flag className="w-4 h-4" />
                <span>Status</span>
              </div>
              <Badge className={statusColorMap[task.taskStatus]}>{task.taskStatus}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Flag className="w-4 h-4" />
                <span>Priority</span>
              </div>
              <Badge className={priorityColorMap[task.taskPriority]}>{task.taskPriority}</Badge>
            </div>
          </div>

          {/* Dates */}
          {(task.startAt || task.endAt) && (
            <div className="grid grid-cols-2 gap-4">
              {task.startAt && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </div>
                  <p className="text-sm">
                    {new Date(task.startAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {task.endAt && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due Date</span>
                  </div>
                  <p className="text-sm">
                    {new Date(task.endAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                {task.description}
              </p>
            </div>
          )}

          {/* Assignees */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Assignees</span>
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
                <span>Sub-tasks ({task.subtasks.filter(s => s.subtaskStatus === 'Done').length}/{task.subtasks.length})</span>
              </div>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {task.subtasks.map((subtask) => {
                    const isDone = subtask.subtaskStatus === 'Done';
                    const isUpdating = updatingSubtaskId === subtask.subtaskId;

                    return (
                        <div key={subtask.subtaskId} className="flex items-center space-x-2 group">
                            {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                                <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleSubtask(subtask.subtaskId, subtask.subtaskStatus)}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary"
                                />
                            )}
                            
                            <span 
                                className={`text-sm transition-colors cursor-pointer select-none ${
                                    isDone ? 'line-through text-muted-foreground' : ''
                                }`}
                                onClick={() => !isUpdating && handleToggleSubtask(subtask.subtaskId, subtask.subtaskStatus)}
                            >
                                {subtask.title}
                            </span>
                        </div>
                    )
                })}
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <span>Attachments</span>
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

          {/* Event Info */}
          {task.eventId && task.eventTitle && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Event</span>
              </div>
              <Badge variant="outline">{task.eventTitle}</Badge>
            </div>
          )}

          {/* Created Date */}
          {task.createdAt && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Created on {new Date(task.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>

          <div className="flex space-x-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90">
              <Edit className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}