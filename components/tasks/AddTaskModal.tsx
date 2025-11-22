'use client'

import React, { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
import {
  Task,
  Subtask,
  Attachment,
  TaskStatus,
  TaskPriority,
  UserLite,
} from "@/lib/types"
import { useTaskStore } from "@/stores/task-store"
import { toast } from "react-hot-toast"

function getDateTimeDefaults() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

const getLabelClassName = (value: string | undefined | null) => {
  return `flex items-center space-x-2 ${!value ? 'text-destructive' : ''}`;
};

interface AddTaskModalProps {
  isOpen: boolean
  eventMembers?: UserLite[]
  currentUser: UserLite
  isPersonal?: boolean
  onClose: () => void
  eventId?: string | null
  onCreateTask?: (taskData: Omit<Task, "taskId" | "createdAt">) => void
}

export function AddTaskModal({
  isOpen,
  eventMembers = [],
  currentUser,
  isPersonal = false,
  onClose,
  eventId,
  onCreateTask,
}: AddTaskModalProps) {
  const addTask = useTaskStore((state) => state.addTask)

  const { date: defaultDate, time: defaultTime } = getDateTimeDefaults();
  const defaultDateTimeISO = new Date(`${defaultDate}T${defaultTime}`).toISOString();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignees: [] as UserLite[],
    startAt: null as string | null,
    endAt: defaultDateTimeISO as string | null, // Default to current datetime
    taskStatus: "To Do" as TaskStatus,
    taskPriority: "Normal" as TaskPriority,
    subtasks: [] as Subtask[],
    attachments: [] as Attachment[],
  })

  const [hasTimePeriod, setHasTimePeriod] = useState(false)
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("")

  // Automatically assign current user when personal mode is active
  useEffect(() => {
    if (isPersonal && currentUser) {
      setTaskData((prev) => ({
        ...prev,
        assignees: [currentUser],
      }))
    }
  }, [isPersonal, currentUser])

  // Ensure current user is always assigned in personal mode (even if modal reopens)
  useEffect(() => {
    if (isOpen) {
      if (isPersonal && currentUser) {
        setTaskData((prev) => {
          const alreadyAssigned = prev.assignees.some(
            (a) => a.userId === currentUser.userId
          )
          return alreadyAssigned ? prev : { ...prev, assignees: [currentUser] }
        })
      }
      // Initialize endAt with defaultDateTimeISO if it's null when modal opens
      setTaskData(prev => ({
        ...prev,
        endAt: prev.endAt || defaultDateTimeISO,
      }));
    }
  }, [isOpen, isPersonal, currentUser, defaultDateTimeISO])

  // Validate form state using useMemo to avoid unnecessary re-renders
  const isFormValid = useMemo(() => {
    if (!taskData.title.trim()) return false
    if (!taskData.taskPriority || !taskData.taskStatus) return false
    if (!isPersonal && taskData.assignees.length === 0) return false
    if (hasTimePeriod) {
      if (!taskData.startAt || !taskData.endAt) return false
    } else {
      if (!taskData.endAt) return false
    }
    return true
  }, [taskData, hasTimePeriod, isPersonal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskData.title.trim()) {
      toast.error("Please enter a task name.");
      return;
    }
    if (!isPersonal && taskData.assignees.length === 0) {
      toast.error("Please assign at least one team member.");
      return;
    }
    if (hasTimePeriod) {
      if (!taskData.startAt) {
        toast.error("Please select a start date and time.");
        return;
      }
      if (!taskData.endAt) {
        toast.error("Please select an end date and time.");
        return;
      }
      if (taskData.startAt && taskData.endAt && new Date(taskData.startAt) >= new Date(taskData.endAt)) {
        toast.error("Start date and time must be before end date and time.");
        return;
      }
    } else {
      if (!taskData.endAt) {
        toast.error("Please select a due date and time.");
        return;
      }
    }

    const finalTask: Omit<Task, "taskId" | "createdAt"> = {
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

    if (onCreateTask) onCreateTask(finalTask)
    else addTask(finalTask)

    // Reset form
    setTaskData({
      title: "",
      description: "",
      assignees: isPersonal ? [currentUser] : [],
      startAt: null,
      endAt: defaultDateTimeISO, // Reset to default datetime
      taskStatus: "To Do",
      taskPriority: "Normal",
      subtasks: [],
      attachments: [],
    })
    setHasTimePeriod(false)
    setNewAttachmentUrl("")
    onClose()
  }

  // Handle toggle add/remove assignees (prevent removing current user in personal mode)
  const handleAssigneeToggle = (member: UserLite) => {
    setTaskData((prev) => {
      const already = prev.assignees.some((a) => a.userId === member.userId)
      if (already) {
        if (isPersonal && member.userId === currentUser.userId) return prev
        return {
          ...prev,
          assignees: prev.assignees.filter((a) => a.userId !== member.userId),
        }
      } else {
        return { ...prev, assignees: [...prev.assignees, member] }
      }
    })
  }

  const removeAssignee = (member: UserLite) =>
    setTaskData((prev) =>
      isPersonal && member.userId === currentUser.userId
        ? prev
        : {
            ...prev,
            assignees: prev.assignees.filter(
              (a) => a.userId !== member.userId
            ),
          }
    )

  const addAttachment = () => {
    const url = newAttachmentUrl.trim()
    if (!url) return
    const newAttachment: Attachment = {
      attachmentId: `att_${Date.now()}`,
      attachmentUrl: url,
      taskId: "",
    }
    setTaskData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment],
    }))
    setNewAttachmentUrl("")
  }

  const removeAttachment = (id: string) =>
    setTaskData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.attachmentId !== id),
    }))

  const addSubTask = () =>
    setTaskData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        {
          subtaskId: `st_${Date.now()}`,
          title: "",
          subtaskStatus: "To Do",
          taskId: "",
        },
      ],
    }))

  const updateSubTask = (index: number, name: string) =>
    setTaskData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st, i) =>
        i === index ? { ...st, title: name } : st
      ),
    }))

  const removeSubTask = (index: number) =>
    setTaskData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Label htmlFor="taskName" className={!taskData.title ? 'text-destructive' : ''}>Task Name *</Label>
            <Input
              id="taskName"
              value={taskData.title}
              onChange={(e) =>
                setTaskData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Date / Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasTimePeriod"
                checked={hasTimePeriod}
                onChange={(e) => {
                  const checked = e.target.checked
                  setHasTimePeriod(checked)
                  if (!checked)
                    setTaskData((prev) => ({ ...prev, startAt: null }))
                }}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="hasTimePeriod" className="text-sm">
                Schedule task with specific time period
              </Label>
            </div>

            {hasTimePeriod ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="startAt"
                    className={getLabelClassName(taskData.startAt)}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Start Date *</span>
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={taskData.startAt ? taskData.startAt.substring(0, 16) : ""}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        startAt: new Date(e.target.value).toISOString(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt" className={getLabelClassName(taskData.endAt)}>
                    <Calendar className="w-4 h-4" />
                    <span>End Date *</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={taskData.endAt ? taskData.endAt.substring(0, 16) : ""}
                    min={taskData.startAt ? taskData.startAt.substring(0, 16) : ""}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        endAt: new Date(e.target.value).toISOString(),
                      }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="endAt" className={getLabelClassName(taskData.endAt)}>
                  <Calendar className="w-4 h-4" />
                  <span>Due Date *</span>
                </Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={taskData.endAt ? taskData.endAt.substring(0, 16) : ""}
                  onChange={(e) =>
                    setTaskData((prev) => ({
                      ...prev,
                      endAt: new Date(e.target.value).toISOString(),
                    }))
                  }
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
              value={taskData.taskPriority}
              onValueChange={(value: TaskPriority) =>
                setTaskData((prev) => ({ ...prev, taskPriority: value }))
              }
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
            <Label>Status</Label>
            <Select
              value={taskData.taskStatus}
              onValueChange={(value: TaskStatus) =>
                setTaskData((prev) => ({ ...prev, taskStatus: value }))
              }
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
              <Button type="button" variant="outline" size="sm" onClick={addSubTask}>
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
                      onChange={(e) => updateSubTask(index, e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubTask(index)}
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
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttachment}
                disabled={!newAttachmentUrl.trim()}
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
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(att.attachmentId)}
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
            <Label className={getLabelClassName(isPersonal || taskData.assignees.length > 0 ? "assigned" : null)}>
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
                      onClick={() => removeAssignee(a)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
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
                  eventMembers.map((m) => (
                    <button
                      key={m.userId}
                      type="button"
                      onClick={() => handleAssigneeToggle(m)}
                      className={`text-left p-2 rounded-md border transition-colors ${
                        taskData.assignees.some((a) => a.userId === m.userId) ||
                        (isPersonal && m.userId === currentUser.userId)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-white border-border hover:bg-muted/50"
                      }`}
                    >
                      {m.username}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">
                    No team members available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}