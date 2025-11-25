'use client'

import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckSquare, Calendar, Users, X, Flag, Plus, Trash2, Paperclip, ExternalLink, Loader2 } from 'lucide-react'
import type { UserLite, TaskStatus, TaskPriority } from '@/lib/types'
import { useTasksStore } from "@/stores/task-store"
import { useUiStore } from "@/stores/ui-store"
import { useFetchTask, useEditTask } from '@/lib/client/features/tasks/hooks'
import { toast } from 'sonner'

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAssignees: UserLite[];
  taskId: string | null;  
}


export function EditTaskModal({ availableAssignees }: EditTaskModalProps) {
  const { 
    isEditTaskModalOpen, 
    selectedTaskIdForEdit, 
    closeEditTaskModal 
  } = useUiStore()

  // Fetch task data using React Query
  const { 
    data: editingTask, 
    isLoading: isLoadingTask,
    error: taskError 
  } = useFetchTask(selectedTaskIdForEdit || '')

  // Zustand store for form data (UI state only)
  const {
    editFormData,
    editHasTimePeriod,
    editNewAttachmentUrl,
    isEditPending,
    editError,
    setEditTitle,
    setEditDescription,
    setEditStartAt,
    setEditEndAt,
    setEditTaskStatus,
    setEditTaskPriority,
    toggleEditAssignee,
    removeEditAssignee,
    addEditSubtask,
    updateEditSubtask,
    removeEditSubtask,
    addEditAttachment,
    removeEditAttachment,
    setEditNewAttachmentUrl,
    setEditHasTimePeriod,
    setEditIsPending,
    setEditError,
    isEditFormValid,
    openEditModal,
  } = useTasksStore()

  const editTaskMutation = useEditTask()

  // Initialize edit form when task is loaded
  useEffect(() => {
    if (editingTask && isEditTaskModalOpen) {
      openEditModal(editingTask)
    }
  }, [editingTask, isEditTaskModalOpen, openEditModal])

  useEffect(() => {
    setEditIsPending(editTaskMutation.isPending)
  }, [editTaskMutation.isPending, setEditIsPending])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditFormValid() || isEditPending || !editingTask) return

    try {
      setEditError(null)
      
      await editTaskMutation.mutateAsync({
        taskId: editingTask.taskId,
        patch: {
          title: editFormData.title.trim(),
          description: editFormData.description?.trim() || undefined,
          assignees: editFormData.assignees,
          startAt: editHasTimePeriod ? editFormData.startAt : null,
          endAt: editFormData.endAt,
          taskStatus: editFormData.taskStatus,
          taskPriority: editFormData.taskPriority,
          subtasks: editFormData.subtasks.length ? editFormData.subtasks : undefined,
          attachments: editFormData.attachments.length ? editFormData.attachments : undefined,
        },
      })

      toast.success('Task updated successfully!')
      closeEditTaskModal()
    } catch (error) {
      console.error('Failed to update task:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to update task. Please try again.'
      setEditError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleClose = () => {
    if (!isEditPending) {
      closeEditTaskModal()
    }
  }

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('docs.google.com')) return 'Google Doc'
      if (urlObj.hostname.includes('figma.com')) return 'Figma Design'
      if (urlObj.hostname.includes('github.com')) return 'GitHub Repository'
      if (urlObj.hostname.includes('drive.google.com')) return 'Google Drive File'
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'Link'
    }
  }

  const getFaviconFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('docs.google.com')) return '📄'
      if (urlObj.hostname.includes('figma.com')) return '🎨'
      if (urlObj.hostname.includes('github.com')) return '💻'
      if (urlObj.hostname.includes('drive.google.com')) return '📂'
      return '🔗'
    } catch {
      return '🔗'
    }
  }

  // Loading skeleton when task data is being fetched
  if (isLoadingTask && isEditTaskModalOpen) {
    return (
      <Dialog open={isEditTaskModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </DialogHeader>
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (taskError && isEditTaskModalOpen) {
    return (
      <Dialog open={isEditTaskModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error Loading Task</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {taskError.message || 'Failed to load task data'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!editingTask) return null

  return (
    <Dialog open={isEditTaskModalOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span>Edit Task</span>
          </DialogTitle>
          <DialogDescription>
            Update task details, assignees, priority, and attachments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              placeholder="Enter task name"
              value={editFormData.title}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isEditPending}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editFormData.description}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              disabled={isEditPending}
            />
          </div>

          {/* Time Period Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasTimePeriod"
                checked={editHasTimePeriod}
                onChange={(e) => {
                  if (isEditPending) return
                  setEditHasTimePeriod(e.target.checked)
                }}
                disabled={isEditPending}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="hasTimePeriod" className="text-sm">
                Schedule task with specific time period
              </Label>
            </div>

            {editHasTimePeriod ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={editFormData.startAt?.substring(0, 16) || ""}
                    onChange={(e) =>
                      setEditStartAt(e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                    disabled={isEditPending}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endAt" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>End Date</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={editFormData.endAt?.substring(0, 16) || ""}
                    onChange={(e) =>
                      setEditEndAt(e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                    min={editFormData.startAt?.substring(0, 16) || ""}
                    disabled={isEditPending}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="endAt" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </Label>
                <Input
                  id="endAt"
                  type="date"
                  value={editFormData.endAt?.substring(0, 10) || ""}
                  onChange={(e) =>
                    setEditEndAt(e.target.value ? new Date(e.target.value).toISOString() : null)
                  }
                  disabled={isEditPending}
                />
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Flag className="w-4 h-4" />
              <span>Priority</span>
            </Label>
            <Select
              value={editFormData.taskPriority}
              onValueChange={(value: TaskPriority) => setEditTaskPriority(value)}
              disabled={isEditPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Urgent</span>
                  </div>
                </SelectItem>
                <SelectItem value="High">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="Normal">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="Low">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span>Low</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={editFormData.taskStatus}
              onValueChange={(value: TaskStatus) => setEditTaskStatus(value)}
              disabled={isEditPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sub-tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sub-tasks</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addEditSubtask(editingTask.taskId)}
                disabled={isEditPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {editFormData.subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {editFormData.subtasks.map((subtask, index) => (
                  <div key={subtask.subtaskId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.subtaskStatus === 'Done'}
                      onChange={(e) =>
                        updateEditSubtask(index, 'subtaskStatus', e.target.checked ? 'Done' : 'To Do')
                      }
                      disabled={isEditPending}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Input
                      value={subtask.title}
                      onChange={(e) => updateEditSubtask(index, 'title', e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                      disabled={isEditPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEditSubtask(index)}
                      className="text-destructive hover:text-destructive"
                      disabled={isEditPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4" />
                <span>Attachments</span>
              </Label>
            </div>
            
            {/* Add Attachment */}
            <div className="flex space-x-2">
              <Input
                value={editNewAttachmentUrl}
                onChange={(e) => setEditNewAttachmentUrl(e.target.value)}
                placeholder="Paste a link here..."
                className="flex-1"
                disabled={isEditPending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addEditAttachment(editingTask.taskId)}
                disabled={!editNewAttachmentUrl.trim() || isEditPending}
              >
                Add Link
              </Button>
            </div>

            {/* Attached Links */}
            {editFormData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {editFormData.attachments.map((attachment) => {
                  const title = extractTitleFromUrl(attachment.attachmentUrl)
                  const favicon = getFaviconFromUrl(attachment.attachmentUrl)
                  return (
                    <div key={attachment.attachmentId} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-lg">{favicon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{title || attachment.attachmentUrl}</div>
                          <div className="text-xs text-muted-foreground truncate">{attachment.attachmentUrl}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.attachmentUrl, '_blank')}
                          className="shrink-0"
                          disabled={isEditPending}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEditAttachment(attachment.attachmentId)}
                        className="text-destructive hover:text-destructive shrink-0 ml-2"
                        disabled={isEditPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Assignees</span>
            </Label>
            
            {/* Selected Assignees */}
            {editFormData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {editFormData.assignees.map((assignee) => (
                  <Badge key={assignee.userId} variant="secondary" className="flex items-center space-x-1">
                    <span>{assignee.username}</span>
                    <button
                      type="button"
                      onClick={() => removeEditAssignee(assignee.userId)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      disabled={isEditPending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Available Members */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Available Team Members:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableAssignees.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleEditAssignee(member)}
                    disabled={isEditPending}
                    className={`text-left p-2 rounded-md border transition-colors ${
                      editFormData.assignees.some(a => a.userId === member.userId)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-border hover:bg-muted/50'
                    } ${isEditPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {member.username}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error message */}
          {editError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{editError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isEditPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isEditFormValid() || isEditPending}
            >
              {isEditPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}