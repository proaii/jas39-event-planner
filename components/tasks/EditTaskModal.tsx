'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Calendar, Users, X, Flag, Plus, Trash2, Paperclip, ExternalLink } from 'lucide-react';
import type { Task, Subtask, Attachment, UserLite, TaskStatus, TaskPriority } from '@/lib/types';
import { useTaskStore } from '@/stores/task-store'; 

export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  availableAssignees: UserLite[];
}

export function EditTaskModal({
  isOpen,
  onClose,
  task,
  availableAssignees,
}: EditTaskModalProps) {
  const { updateTask } = useTaskStore();

  const [formData, setFormData] = useState<{
    title: string;
    description?: string;
    assignees: UserLite[];
    startAt?: string | null;
    endAt?: string | null;
    taskStatus: TaskStatus;
    taskPriority: TaskPriority;
    subtasks: Subtask[];
    attachments: Attachment[];
  }>({
    title: task?.title || '',
    description: task?.description || '',
    assignees: task?.assignees || [],
    startAt: task?.startAt || null,
    endAt: task?.endAt || null,
    taskStatus: task?.taskStatus || 'To Do',
    taskPriority: task?.taskPriority || 'Normal',
    subtasks: task?.subtasks || [],
    attachments: task?.attachments || [],
  });

  const [hasTimePeriod, setHasTimePeriod] = useState(!!task?.startAt || !!task?.endAt);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assignees: task.assignees || [],
        startAt: task.startAt || null,
        endAt: task.endAt || null,
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        subtasks: task.subtasks || [],
        attachments: task.attachments || [],
      });
      setHasTimePeriod(!!task.startAt || !!task.endAt);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    updateTask(task.taskId, formData);
    onClose();
  };

  const handleAssigneeToggle = (assignee: UserLite) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.some(a => a.userId === assignee.userId)
        ? prev.assignees.filter(a => a.userId !== assignee.userId)
        : [...prev.assignees, assignee]
    }));
  };

  const removeAssignee = (assigneeToRemove: UserLite) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(a => a.userId !== assigneeToRemove.userId)
    }));
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      subtaskId: `st_${Date.now()}`,
      taskId: task?.taskId || '',
      title: '',
      subtaskStatus: 'To Do'
    };
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }));
  };

  const updateSubtask = (index: number, field: keyof Subtask, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((st, i) =>
        i === index ? { ...st, [field]: value } : st
      )
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const addAttachment = () => {
    if (!newAttachmentUrl.trim() || !task) return;
    const newAttachment: Attachment = {
      attachmentId: `att_${Date.now()}`,
      taskId: task.taskId,
      attachmentUrl: newAttachmentUrl.trim()
    };
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));
    setNewAttachmentUrl('');
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.attachmentId !== attachmentId)
    }));
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('docs.google.com')) return 'Google Doc';
      if (urlObj.hostname.includes('figma.com')) return 'Figma Design';
      if (urlObj.hostname.includes('github.com')) return 'GitHub Repository';
      if (urlObj.hostname.includes('drive.google.com')) return 'Google Drive File';
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  const getFaviconFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('docs.google.com')) return '📄';
      if (urlObj.hostname.includes('figma.com')) return '🎨';
      if (urlObj.hostname.includes('github.com')) return '💻';
      if (urlObj.hostname.includes('drive.google.com')) return '📂';
      return '🔗';
    } catch {
      return '🔗';
    }
  };

  const isFormValid = React.useMemo(() => {
    if (!formData.title.trim()) return false;
    if (!formData.taskPriority || !formData.taskStatus) return false;

    if (hasTimePeriod) {
      if (!formData.startAt || !formData.endAt) return false;
      if (formData.startAt > formData.endAt) return false;
    } else {
      if (!formData.endAt) return false;
    }

    return true;
  }, [formData, hasTimePeriod]);

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description (optional)"
              rows={3}
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
                  const hasPeriod = e.target.checked;
                  setHasTimePeriod(hasPeriod);
                  if (!hasPeriod) {
                    setFormData(prev => ({ 
                      ...prev, 
                      startAt: null,
                      endAt: null,
                    }));
                  }
                }}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="hasTimePeriod" className="text-sm">Schedule task with specific time period</Label>
            </div>

            {hasTimePeriod ? (
              <>
                {/* Start and End Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startAt" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date</span>
                    </Label>
                    <Input
                      id="startAt"
                      type="datetime-local"
                      value={formData.startAt?.substring(0, 16) || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, startAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
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
                      value={formData.endAt?.substring(0, 16) || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, endAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      min={formData.startAt?.substring(0, 16) || ""}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Fallback to simple due date */
              <div className="space-y-2">
                <Label htmlFor="endAt" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </Label>
                <Input
                  id="endAt"
                  type="date"
                  value={formData.endAt?.substring(0, 10) || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, endAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
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
            <Select value={formData.taskPriority} onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, taskPriority: value }))}>
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
            <Select value={formData.taskStatus} onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, taskStatus: value }))}>
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
              <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {formData.subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {formData.subtasks.map((subtask, index) => (
                  <div key={subtask.subtaskId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.subtaskStatus === 'Done'}
                      onChange={(e) => updateSubtask(index, 'subtaskStatus', e.target.checked ? 'Done' : 'To Do')}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Input
                      value={subtask.title}
                      onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                      placeholder="Enter sub-task name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(index)}
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
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4" />
                <span>Attachments</span>
              </Label>
            </div>
            
            {/* Add Attachment */}
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

            {/* Attached Links */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {formData.attachments.map((attachment) => {
                  const title = extractTitleFromUrl(attachment.attachmentUrl);
                  const favicon = getFaviconFromUrl(attachment.attachmentUrl);
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
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.attachmentId)}
                        className="text-destructive hover:text-destructive shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
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
            {formData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {formData.assignees.map((assignee) => (
                  <Badge key={assignee.userId} variant="secondary" className="flex items-center space-x-1">
                    <span>{assignee.username}</span>
                    <button
                      type="button"
                      onClick={() => removeAssignee(assignee)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
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
                    className={`text-left p-2 rounded-md border transition-colors ${
                      formData.assignees.some(a => a.userId === member.userId)
                        ? 'bg-foreground-muted border-border hover:bg-muted/50'
                        : 'bg-primary/10 border-primary text-primary'
                    }`}
                  >
                    {member.username}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!isFormValid}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
