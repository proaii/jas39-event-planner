'use client'

import React, { useEffect, useCallback, useState } from "react"
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
import { Task, TaskPriority, TaskStatus, UserLite, Subtask, Attachment } from "@/lib/types" // Merged imports
import { useUiStore } from "@/stores/ui-store" // Merged imports
import { useToast } from "@/components/ui/use-toast"
import { useCreateEventTask, useCreatePersonalTask } from '@/lib/client/features/tasks/hooks';
import { initialTaskData } from '@/lib/constants';
import { generateId } from '@/lib/utils';

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  eventMembers?: UserLite[]
  currentUser?: UserLite | null
  isPersonal?: boolean
  eventId?: string | null
}


export function AddTaskModal({
  isOpen, // From Updated upstream
  onClose, // From Updated upstream
  eventMembers = [],
  currentUser,
  isPersonal = false,
  eventId,
}: AddTaskModalProps) {
  const { toast } = useToast()

  // UI Store (my version) - closeAddTaskModal is not needed here
  const { isAddTaskModalOpen: _isAddTaskModalOpen, closeAddTaskModal: _closeAddTaskModal } = useUiStore()

  // Local component state for form data
  const [title, setTitle] = useState(initialTaskData.title);
  const [description, setDescription] = useState(initialTaskData.description);
  const [startAt, setStartAt] = useState<string | null>(initialTaskData.startAt);
  const [endAt, setEndAt] = useState<string | null>(initialTaskData.endAt);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(initialTaskData.taskStatus);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(initialTaskData.taskPriority);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTaskData.subtasks);
  const [attachments, setAttachments] = useState<Attachment[]>(initialTaskData.attachments);
  const [assignees, setAssignees] = useState<UserLite[]>(initialTaskData.assignees);
  const [hasTimePeriod, setHasTimePeriod] = useState(initialTaskData.hasTimePeriod);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  // Mutations
  const createEventTaskMutation = useCreateEventTask(eventId || '');
  const createPersonalTaskMutation = useCreatePersonalTask();
  const isPending = createEventTaskMutation.isPending || createPersonalTaskMutation.isPending;
  const error = createEventTaskMutation.error?.message || createPersonalTaskMutation.error?.message;

  // Local reset form function
  const resetForm = useCallback(() => {
    setTitle(initialTaskData.title);
    setDescription(initialTaskData.description);
    setStartAt(initialTaskData.startAt);
    setEndAt(initialTaskData.endAt);
    setTaskStatus(initialTaskData.taskStatus);
    setTaskPriority(initialTaskData.taskPriority);
    setSubtasks(initialTaskData.subtasks);
    setAttachments(initialTaskData.attachments);
    setAssignees(initialTaskData.assignees);
    setHasTimePeriod(initialTaskData.hasTimePeriod);
    setNewAttachmentUrl('');
  }, []); // Depend on nothing as initialTaskData is constant

  // Helper function to check form validity (moved from Zustand)
  const isFormValid = useCallback((isPersonalMode: boolean) => {
    if (!title.trim()) return false;
    if (!assignees.length && !isPersonalMode) return false;
    if (hasTimePeriod && (!startAt || !endAt)) return false;
    if (!hasTimePeriod && !endAt) return false;
    if (endAt && startAt && new Date(startAt) > new Date(endAt)) return false;

    return true;
  }, [title, assignees, hasTimePeriod, startAt, endAt]);

  // Actions for subtasks and attachments (moved from Zustand)
  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { subtaskId: generateId(), title: '', subtaskStatus: 'To Do' }]);
  };

  const handleUpdateSubtask = (index: number, newTitle: string) => {
    setSubtasks((prev) => prev.map((st, i) => (i === index ? { ...st, title: newTitle } : st)));
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    if (newAttachmentUrl.trim()) {
      setAttachments((prev) => [...prev, { attachmentId: generateId(), taskId: '', attachmentUrl: newAttachmentUrl.trim() }]);
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.attachmentId !== attachmentId));
  };
  // Automatically assign current user when personal mode is active
  useEffect(() => {
    if (isOpen && isPersonal && currentUser) { // Changed isAddTaskModalOpen to isOpen
      const alreadyAssigned = assignees.some(
        (a) => a.userId === currentUser.userId
      )
      if (!alreadyAssigned) {
        setAssignees([currentUser])
      }
    }
  }, [isOpen, isPersonal, currentUser, assignees, setAssignees])

  // Auto-assign current user on first open
  useEffect(() => {
    if (isOpen && currentUser && assignees.length === 0) { // Changed isAddTaskModalOpen to isOpen
      setAssignees([currentUser])
    }
  }, [isOpen, currentUser, assignees.length, setAssignees])


  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

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

    const payload: Omit<Task, "taskId" | "createdAt" | "eventTitle"> = {
      title: title.trim(),
      description: description?.trim() || undefined,
      assignees: assignees,
      startAt: hasTimePeriod ? startAt : null,
      endAt: endAt,
      taskStatus: taskStatus,
      taskPriority: taskPriority,
      subtasks: subtasks.length ? subtasks : undefined,
      attachments: attachments.length ? attachments : undefined,
      eventId: eventId || null,
    }

    const mutation = isPersonal ? createPersonalTaskMutation : createEventTaskMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Task created successfully",
        })
        resetForm(); // Use local resetForm
        onClose(); // Changed closeAddTaskModal to onClose
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to create task",
          variant: "destructive",
        })
      },
    });
  }

  const handleClose = () => {
    resetForm();
    onClose(); // Changed closeAddTaskModal to onClose
  }

  const handleAssigneeToggle = (member: UserLite) => {
    if (!currentUser) return;
    setAssignees((prevAssignees) => {
      const alreadyAssigned = prevAssignees.some((a) => a.userId === member.userId);
      if (alreadyAssigned) {
        return prevAssignees.filter((a) => a.userId !== member.userId);
      } else {
        return [...prevAssignees, member];
      }
    });
  };

  const handleRemoveAssignee = (member: UserLite) => {
    if (isPersonal && member.userId === currentUser?.userId) return; // Prevent removing self in personal mode
    setAssignees((prevAssignees) => prevAssignees.filter((a) => a.userId !== member.userId));
  };

  const handleTimePeriodToggle = (checked: boolean) => {
    setHasTimePeriod(checked)
  }

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
              value={title}
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
              value={description}
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
                    value={startAt ? startAt.substring(0, 16) : ""}
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
                    value={endAt ? endAt.substring(0, 16) : ""}
                    min={startAt?.substring(0, 16) || ""}
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
                  value={endAt ? endAt.substring(0, 16) : ""}
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
              value={taskPriority}
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
              value={taskStatus}
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
                onClick={handleAddSubtask}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {subtasks.map((subTask, index) => (
                  <div key={subTask.subtaskId} className="flex items-center space-x-2">
                    <Input
                      value={subTask.title}
                      onChange={(e) => handleUpdateSubtask(index, e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtask(index)}
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
                onClick={handleAddAttachment}
                disabled={!newAttachmentUrl.trim() || isPending}
              >
                Add Link
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {attachments.map((att) => (
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
                      onClick={() => handleRemoveAttachment(att.attachmentId)}
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
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {assignees.map((a) => (
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
                    const isAssigned = assignees.some(
                      (a) => a.userId === m.userId
                    )
                    const isCurrentUserInPersonal = isPersonal && m.userId === currentUser?.userId

                    return (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => handleAssigneeToggle(m)}
                        disabled={isPending || isCurrentUserInPersonal}
                        className={`text-left p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isAssigned || isCurrentUserInPersonal
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