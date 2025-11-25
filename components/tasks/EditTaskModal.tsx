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
import type { UserLite, TaskStatus, TaskPriority, Task, Subtask, Attachment } from '@/lib/types'
import { useUiStore } from "@/stores/ui-store"
import { useEditTask, useFetchTask } from '@/lib/client/features/tasks/hooks'
import { toast } from 'sonner'
import { extractTitleFromUrl, getFaviconFromUrl, generateId } from '@/lib/utils';
import { initialTaskData } from '@/lib/constants'; // Not directly used for initial state, but for reference/reset

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAssignees: UserLite[];
  taskId?: string | null;
}


export function EditTaskModal({ availableAssignees }: EditTaskModalProps) {
  const { 
    isEditTaskModalOpen, 
    selectedTaskIdForEdit, 
    closeEditTaskModal 
  } = useUiStore()

  // Fetch task data using React Query
  const { data: editingTask, isLoading, isError, error: fetchError } = useFetchTask(selectedTaskIdForEdit || '');

  // Local component state for form data
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState<string | undefined>(undefined);
  const [startAt, setStartAt] = React.useState<string | null>(null);
  const [endAt, setEndAt] = React.useState<string | null>(null);
  const [taskStatus, setTaskStatus] = React.useState<TaskStatus>('To Do');
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>('Normal');
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [assignees, setAssignees] = React.useState<UserLite[]>([]);
  const [hasTimePeriod, setHasTimePeriod] = React.useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = React.useState('');

  const editTaskMutation = useEditTask()

  const isEditPending = isLoading || editTaskMutation.isPending;
  const editError = isError ? fetchError?.message : editTaskMutation.error?.message;


  // Effect to initialize form data when editingTask is loaded or changes
  React.useEffect(() => {
    if (editingTask && isEditTaskModalOpen) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStartAt(editingTask.startAt || null);
      setEndAt(editingTask.endAt || null);
      setTaskStatus(editingTask.taskStatus);
      setTaskPriority(editingTask.taskPriority);
      setSubtasks(editingTask.subtasks || []);
      setAttachments(editingTask.attachments || []);
      setAssignees(editingTask.assignees || []);
      setHasTimePeriod(!!editingTask.startAt && !!editingTask.endAt); // Assuming if both are present, it has a time period
      setNewAttachmentUrl('');
    } else if (!isEditTaskModalOpen) {
      // Reset form when modal closes
      setTitle('');
      setDescription(undefined);
      setStartAt(null);
      setEndAt(null);
      setTaskStatus('To Do');
      setTaskPriority('Normal');
      setSubtasks([]);
      setAttachments([]);
      setAssignees([]);
      setHasTimePeriod(false);
      setNewAttachmentUrl('');
    }
  }, [editingTask, isEditTaskModalOpen,
      setTitle, setDescription, setStartAt, setEndAt, setTaskStatus, setTaskPriority,
      setSubtasks, setAttachments, setAssignees, setHasTimePeriod, setNewAttachmentUrl]);


  // Helper function to check form validity
  const isEditFormValid = React.useCallback(() => {
    if (!title.trim()) return false;
    if (!assignees.length) return false; // Assignees are always required for an existing task
    if (hasTimePeriod && (!startAt || !endAt)) return false;
    if (!hasTimePeriod && !endAt) return false;
    if (endAt && startAt && new Date(startAt) > new Date(endAt)) return false;

    return true;
  }, [title, assignees, hasTimePeriod, startAt, endAt]);

  // Actions for subtasks and attachments
  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { subtaskId: generateId(), title: '', subtaskStatus: 'To Do' }]);
  };

  const handleUpdateSubtask = (index: number, key: keyof Subtask, value: any) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, [key]: value } : st))
    );
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    if (newAttachmentUrl.trim() && editingTask) { // Ensure editingTask is not null for taskId
      setAttachments((prev) => [...prev, { attachmentId: generateId(), taskId: editingTask.taskId, attachmentUrl: newAttachmentUrl.trim() }]);
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.attachmentId !== attachmentId));
  };

  const handleAssigneeToggle = React.useCallback((member: UserLite) => {
    setAssignees((prevAssignees) => {
      const alreadyAssigned = prevAssignees.some((a) => a.userId === member.userId);
      if (alreadyAssigned) {
        return prevAssignees.filter((a) => a.userId !== member.userId);
      } else {
        return [...prevAssignees, member];
      }
    });
  }, []);

  const handleRemoveAssignee = React.useCallback((userId: string) => {
    setAssignees((prevAssignees) => prevAssignees.filter((a) => a.userId !== userId));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditFormValid() || isEditPending || !editingTask) return

    try {      
      await editTaskMutation.mutateAsync({
        taskId: editingTask.taskId,
        patch: {
          title: title.trim(),
          description: description?.trim() || undefined,
          assignees: assignees,
          startAt: hasTimePeriod ? startAt : null,
          endAt: endAt,
          taskStatus: taskStatus,
          taskPriority: taskPriority,
          subtasks: subtasks.length ? subtasks : undefined,
          attachments: attachments.length ? attachments : undefined,
        },
      })

      toast.success('Task updated successfully!')
      closeEditTaskModal()
    } catch (error: any) {
      console.error('Failed to update task:', error)
      const errorMsg = error?.message || 'Failed to update task. Please try again.'
      toast.error(errorMsg)
    }
  }

  const handleClose = () => {
    if (!isEditPending) {
      closeEditTaskModal()
    }
  }



  // Loading skeleton when task data is being fetched
  if (isLoading && isEditTaskModalOpen) { // Use isLoading from useFetchTask
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

  if (!editingTask) return null // If not loading and no task, return null (shouldn't happen if selectedTaskIdForEdit is valid)

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isEditPending}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                checked={hasTimePeriod}
                onChange={(e) => {
                  if (isEditPending) return
                  setHasTimePeriod(e.target.checked)
                }}
                disabled={isEditPending}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="hasTimePeriod" className="text-sm">
                Schedule task with specific time period
              </Label>
            </div>

            {hasTimePeriod ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={startAt?.substring(0, 16) || ""}
                    onChange={(e) =>
                      setStartAt(e.target.value ? new Date(e.target.value).toISOString() : null)
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
                    value={endAt?.substring(0, 16) || ""}
                    onChange={(e) =>
                      setEndAt(e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                    min={startAt?.substring(0, 16) || ""}
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
                  value={endAt?.substring(0, 10) || ""}
                  onChange={(e) =>
                    setEndAt(e.target.value ? new Date(e.target.value).toISOString() : null)
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
              value={taskPriority}
              onValueChange={(value: TaskPriority) => setTaskPriority(value)}
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
              value={taskStatus}
              onValueChange={(value: TaskStatus) => setTaskStatus(value)}
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
                onClick={handleAddSubtask}
                disabled={isEditPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.subtaskId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.subtaskStatus === 'Done'}
                      onChange={(e) =>
                        handleUpdateSubtask(index, 'subtaskStatus', e.target.checked ? 'Done' : 'To Do')
                      }
                      disabled={isEditPending}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleUpdateSubtask(index, 'title', e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                      disabled={isEditPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtask(index)}
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
            
            <div className="flex space-x-2">
              <Input
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="Paste a link here..."
                className="flex-1"
                disabled={isEditPending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                disabled={!newAttachmentUrl.trim() || isEditPending}
              >
                Add Link
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {attachments.map((attachment) => {
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
                        onClick={() => handleRemoveAttachment(attachment.attachmentId)}
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
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {assignees.map((assignee) => (
                  <Badge key={assignee.userId} variant="secondary" className="flex items-center space-x-1">
                    <span>{assignee.username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(assignee.userId)}
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
                    onClick={() => handleAssigneeToggle(member)}
                    disabled={isEditPending}
                    className={`text-left p-2 rounded-md border transition-colors ${
                      assignees.some(a => a.userId === member.userId)
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