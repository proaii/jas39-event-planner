"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  X,
  Plus,
  Trash2,
  Flag,
  Paperclip,
  ExternalLink,
  Clock,
} from "lucide-react";

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

interface Task {
  title: string;
  description?: string;
  assignees: string[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Urgent" | "High" | "Normal" | "Low";
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean;
}

interface AddTaskModalProps {
  isOpen: boolean;
  eventMembers?: string[];
  onClose: () => void;
  onCreateTask?: (taskData: Omit<Task, "id" | "status" | "createdAt">) => void;
  onAddTask?: (task: Task) => void;
  currentUser: string;
  isPersonal?: boolean;
}

export function AddTaskModal({
  isOpen,
  eventMembers = [],
  onClose,
  onAddTask,
  onCreateTask,
  currentUser,
  isPersonal = false,
}: AddTaskModalProps) {
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    assignees: [] as string[],
    dueDate: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    status: "To Do" as Task["status"],
    priority: "Normal" as Task["priority"],
    subTasks: [] as SubTask[],
    attachments: [] as Attachment[],
  });

  const [hasTimePeriod, setHasTimePeriod] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");

  useEffect(() => {
    if (isPersonal) {
      setTaskData((prev) => ({ ...prev, assignees: [currentUser] }));
    }
  }, [isPersonal, currentUser]);

  // ตรวจสอบความถูกต้องของฟอร์ม
  const isFormValid = () => {
    if (!taskData.name.trim()) return false;
    if (!taskData.priority) return false;
    if (!taskData.status) return false;
    if (!isPersonal && taskData.assignees.length === 0) return false;

    if (hasTimePeriod) {
      if (!taskData.startDate || !taskData.endDate || !taskData.startTime || !taskData.endTime)
        return false;
    } else {
      if (!taskData.dueDate) return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const finalTask: Task = {
      title: taskData.name,
      description: taskData.description || undefined,
      assignees: taskData.assignees,
      dueDate: taskData.dueDate || undefined,
      startDate: taskData.startDate || undefined,
      endDate: taskData.endDate || undefined,
      startTime: taskData.startTime || undefined,
      endTime: taskData.endTime || undefined,
      status: taskData.status,
      priority: taskData.priority,
      subTasks: taskData.subTasks.length > 0 ? taskData.subTasks : undefined,
      attachments: taskData.attachments.length > 0 ? taskData.attachments : undefined,
      isPersonal: isPersonal || undefined,
    };

    if (isPersonal) {
      onCreateTask?.(finalTask);
    } else {
      onAddTask?.(finalTask);
    }

    // รีเซ็ตฟอร์ม
    setTaskData({
      name: "",
      description: "",
      assignees: isPersonal ? [currentUser] : [],
      dueDate: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      status: "To Do",
      priority: "Normal",
      subTasks: [],
      attachments: [],
    });
    setHasTimePeriod(false);
    setNewAttachmentUrl("");
    onClose();
  };

  const addSubTask = () => {
    const newSubTask: SubTask = { id: `st_${Date.now()}`, name: "", completed: false };
    setTaskData((prev) => ({ ...prev, subTasks: [...prev.subTasks, newSubTask] }));
  };

  const updateSubTask = (index: number, name: string) => {
    setTaskData((prev) => ({
      ...prev,
      subTasks: prev.subTasks.map((st, i) => (i === index ? { ...st, name } : st)),
    }));
  };

  const removeSubTask = (index: number) => {
    setTaskData((prev) => ({
      ...prev,
      subTasks: prev.subTasks.filter((_, i) => i !== index),
    }));
  };

  const addAttachment = () => {
    if (!newAttachmentUrl.trim()) return;
    const newAttachment: Attachment = {
      id: `att_${Date.now()}`,
      url: newAttachmentUrl.trim(),
      title: extractTitleFromUrl(newAttachmentUrl.trim()),
      favicon: getFaviconFromUrl(newAttachmentUrl.trim()),
    };
    setTaskData((prev) => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
    setNewAttachmentUrl("");
  };

  const removeAttachment = (id: string) => {
    setTaskData((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== id) }));
  };

  const extractTitleFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("docs.google.com")) return "Google Doc";
      if (u.hostname.includes("figma.com")) return "Figma Design";
      if (u.hostname.includes("github.com")) return "GitHub Repository";
      if (u.hostname.includes("drive.google.com")) return "Google Drive File";
      return u.hostname.replace("www.", "");
    } catch {
      return "Link";
    }
  };

  const getFaviconFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("docs.google.com")) return "📄";
      if (u.hostname.includes("figma.com")) return "🎨";
      if (u.hostname.includes("github.com")) return "💻";
      if (u.hostname.includes("drive.google.com")) return "📂";
      return "🔗";
    } catch {
      return "🔗";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            {isPersonal
              ? "Create a personal task for yourself."
              : "Create a new task and assign it to a team member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={taskData.name}
              onChange={(e) => setTaskData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          {/* Time Period / Due Date */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasTimePeriod"
                checked={hasTimePeriod}
                onChange={(e) => {
                  const hasPeriod = e.target.checked;
                  setHasTimePeriod(hasPeriod);
                  if (!hasPeriod) {
                    setTaskData((prev) => ({
                      ...prev,
                      startDate: "",
                      endDate: "",
                      startTime: "",
                      endTime: "",
                    }));
                  }
                }}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="hasTimePeriod" className="text-sm">
                Schedule task with specific time period
              </Label>
            </div>

            {hasTimePeriod ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date *</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={taskData.startDate}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>End Date *</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={taskData.endDate}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, endDate: e.target.value }))}
                      min={taskData.startDate}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Start Time *</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={taskData.startTime}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>End Time *</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={taskData.endTime}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date *</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, dueDate: e.target.value }))}
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
              value={taskData.priority}
              onValueChange={(value: Task["priority"]) => setTaskData((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={taskData.status}
              onValueChange={(value: Task["status"]) => setTaskData((prev) => ({ ...prev, status: value }))}
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

          {/* Assignees */}
          {!isPersonal && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Users className="w-4 h-4" /> <span>Assignees *</span>
              </Label>
              {taskData.assignees.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                  {taskData.assignees.map((assignee) => (
                    <Badge key={assignee} variant="secondary" className="flex items-center space-x-1">
                      <span>{assignee}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTaskData((prev) => ({
                            ...prev,
                            assignees: prev.assignees.filter((a) => a !== assignee),
                          }))
                        }
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid()}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
