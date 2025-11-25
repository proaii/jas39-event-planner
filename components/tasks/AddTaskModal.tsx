'use client'

import React, { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  X,
  Plus,
  Trash2,
  Flag,
  Paperclip,
  ExternalLink,
  CheckSquare,
  Loader2,
} from "lucide-react"
import { Task, TaskPriority, TaskStatus, UserLite } from "@/lib/types"
import { useTasksStore } from "@/stores/task-store"
import { useToast } from "@/components/ui/use-toast"
import { useCreateEventTask, useCreatePersonalTask } from "@/lib/client/features/tasks/hooks"
import { useQueryClient } from "@tanstack/react-query" 

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  eventMembers?: UserLite[]
  currentUser?: UserLite | null
  isPersonal?: boolean
  eventId?: string | null
}

export function AddTaskModal({
  isOpen,
  onClose,
  eventMembers = [],
  currentUser,
  isPersonal = false,
  eventId,
}: AddTaskModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient() 

  // Use the appropriate mutation hook based on task type
  const createEventTaskMutation = useCreateEventTask(eventId || '')
  const createPersonalTaskMutation = useCreatePersonalTask()

  const currentMutation = isPersonal ? createPersonalTaskMutation : createEventTaskMutation

  // Tasks Store for form data
  const taskData = useTasksStore((state) => state.taskData)
  const hasTimePeriod = useTasksStore((state) => state.hasTimePeriod)
  const newAttachmentUrl = useTasksStore((state) => state.newAttachmentUrl)

  // Actions
  const setTitle = useTasksStore((state) => state.setTitle)
  const setDescription = useTasksStore((state) => state.setDescription)
  const setStartAt = useTasksStore((state) => state.setStartAt)
  const setEndAt = useTasksStore((state) => state.setEndAt)
  const setTaskStatus = useTasksStore((state) => state.setTaskStatus)
  const setTaskPriority = useTasksStore((state) => state.setTaskPriority)
  const toggleAssignee = useTasksStore((state) => state.toggleAssignee)
  const removeAssignee = useTasksStore((state) => state.removeAssignee)
  const addSubtask = useTasksStore((state) => state.addSubtask)
  const updateSubtask = useTasksStore((state) => state.updateSubtask)
  const removeSubtask = useTasksStore((state) => state.removeSubtask)
  const addAttachment = useTasksStore((state) => state.addAttachment)
  const removeAttachment = useTasksStore((state) => state.removeAttachment)
  const setNewAttachmentUrl = useTasksStore((state) => state.setNewAttachmentUrl)
  const setHasTimePeriod = useTasksStore((state) => state.setHasTimePeriod)
  const isFormValid = useTasksStore((state) => state.isFormValid)
  const resetForm = useTasksStore((state) => state.resetForm)
  const setAssignees = useTasksStore((state) => state.setAssignees)

  // Automatically assign current user when personal mode is active
  useEffect(() => {
    if (!isOpen || !currentUser) return

    const alreadyAssigned = taskData.assignees.some(
      (a) => a.userId === currentUser.userId
    )

    if (!alreadyAssigned) {
      // Personal mode → assign only current user
      if (isPersonal) {
        setAssignees([currentUser])
      } else if (taskData.assignees.length === 0) {
        // Non-personal, assign current user only if no assignees yet
        setAssignees([currentUser])
      }
    }
  }, [isOpen, isPersonal, currentUser, taskData.assignees, setAssignees])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid(isPersonal)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const finalTask: Omit<Task, 'taskId' | 'createdAt' | 'eventTitle'> = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || undefined,
      assignees: taskData.assignees,
      startAt: hasTimePeriod ? taskData.startAt : null,
      endAt: taskData.endAt,
      taskStatus: taskData.taskStatus,
      taskPriority: taskData.taskPriority,
      subtasks: taskData.subtasks.length ? taskData.subtasks : undefined,
      attachments: taskData.attachments.length ? taskData.attachments : undefined,
      eventId: eventId ?? null,
    }

    currentMutation.mutate(finalTask as any, {
      onSuccess: (createdTask) => {
       
        queryClient.setQueryData<Task[]>(["tasks"], (old) => old ? [...old, createdTask] : [createdTask]);

        toast({
          title: "Success",
          description: "Task created successfully",
        });

        if (currentUser) resetForm(currentUser, isPersonal);

        onClose();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to create task",
          variant: "destructive",
        });
      },
    })
  }

  const handleClose = () => {
    if (!currentMutation.isPending && currentUser) {
      resetForm(currentUser, isPersonal)
    }
    onClose()
  }

  const handleAssigneeToggle = (member: UserLite) => {
    if (!currentUser) return
    toggleAssignee(member, isPersonal, currentUser.userId)
  }

  const handleRemoveAssignee = (member: UserLite) => {
    if (isPersonal && member.userId === currentUser?.userId) return
    removeAssignee(member.userId)
  }

  const handleTimePeriodToggle = (checked: boolean) => {
    setHasTimePeriod(checked)
  }

  const isPending = currentMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span>Add New Task</span>
          </DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={taskData.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name"
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter task description (optional)"
              disabled={isPending}
            />
          </div>

          {/* Date / Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasTimePeriod"
                checked={hasTimePeriod}
                onChange={(e) => handleTimePeriodToggle(e.target.checked)}
                disabled={isPending}
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
                    <span>Start Date *</span>
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={taskData.startAt ? taskData.startAt.substring(0, 16) : ""}
                    onChange={(e) => setStartAt(new Date(e.target.value).toISOString())}
                    disabled={isPending}
                    required={hasTimePeriod}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>End Date *</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={taskData.endAt ? taskData.endAt.substring(0, 16) : ""}
                    min={taskData.startAt?.substring(0, 16) || ""}
                    onChange={(e) => setEndAt(new Date(e.target.value).toISOString())}
                    disabled={isPending}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="endAt" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date *</span>
                </Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={taskData.endAt ? taskData.endAt.substring(0, 16) : ""}
                  onChange={(e) => setEndAt(new Date(e.target.value).toISOString())}
                  disabled={isPending}
                  required
                />
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Flag className="w-4 h-4" />
              <span>Priority *</span>
            </Label>
            <Select
              value={taskData.taskPriority}
              onValueChange={(value: TaskPriority) => setTaskPriority(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Urgent", "High", "Normal", "Low"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={taskData.taskStatus}
              onValueChange={(value: TaskStatus) => setTaskStatus(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["To Do", "In Progress", "Done"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sub-tasks</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubtask}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {taskData.subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.subtasks.map((subTask, index) => (
                  <div key={subTask.subtaskId} className="flex items-center space-x-2">
                    <Input
                      value={subTask.title}
                      onChange={(e) => updateSubtask(index, e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(index)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
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
            <Label className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4" />
              <span>Attachments</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="Paste a link here..."
                className="flex-1"
                disabled={isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttachment}
                disabled={!newAttachmentUrl.trim() || isPending}
              >
                Add Link
              </Button>
            </div>
            {taskData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.attachments.map((att) => (
                  <div
                    key={att.attachmentId}
                    className="flex items-center justify-between p-2 rounded-md border bg-background/60 dark:bg-muted/40"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">
                          {att.attachmentUrl}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(att.attachmentUrl, "_blank")}
                        className="shrink-0"
                        disabled={isPending}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(att.attachmentId)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Assignees *</span>
            </Label>
            {taskData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {taskData.assignees.map((a) => (
                  <Badge
                    key={a.userId}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{a.username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(a)}
                      disabled={isPending || (isPersonal && a.userId === currentUser?.userId)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Available Team Members:
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {eventMembers.length > 0 ? (
                  eventMembers.map((m) => {
                    const isAssigned = taskData.assignees.some(
                      (a) => a.userId === m.userId
                    )
                    const isCurrentUserInPersonal = isPersonal && m.userId === currentUser?.userId

                    return (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => handleAssigneeToggle(m)}
                        disabled={isPending || isCurrentUserInPersonal}
                        className={`text-left p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isAssigned || isCurrentUserInPersonal
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-white border-border hover:bg-muted/50"
                        }`}
                      >
                        {m.username}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground p-2">
                    No team members available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid(isPersonal) || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}