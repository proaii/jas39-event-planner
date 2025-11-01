'use client';

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
import { Task, Subtask, Attachment, TaskStatus, TaskPriority, UserLite } from "@/lib/types";

interface AddTaskModalProps {
  isOpen: boolean;
  eventMembers?: UserLite[];
  currentUser: UserLite;
  isPersonal?: boolean;
  onClose: () => void;
  onCreateTask?: (task: Omit<Task, 'taskId' | 'createdAt'>) => void;
  eventId?: string | null;
}

export function AddTaskModal({
  isOpen,
  eventMembers = [],
  currentUser,
  isPersonal = false,
  onClose,
  onCreateTask,
  eventId,
}: AddTaskModalProps) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignees: [] as UserLite[],
    dueDate: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    taskStatus: 'To Do' as TaskStatus,
    taskPriority: 'Normal' as TaskPriority,
    subtasks: [] as Subtask[],
    attachments: [] as Attachment[],
  });
  const [hasTimePeriod, setHasTimePeriod] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (isPersonal) setTaskData(prev => ({ ...prev, assignees: [currentUser] }));
  }, [isPersonal, currentUser]);

  const isFormValid = () => {
    if (!taskData.title.trim()) return false;
    if (!taskData.taskPriority || !taskData.taskStatus) return false;
    if (!isPersonal && taskData.assignees.length === 0) return false;
    if (hasTimePeriod) {
      if (!taskData.startDate || !taskData.endDate || !taskData.startTime || !taskData.endTime) return false;
    } else if (!taskData.dueDate) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const finalTask: Omit<Task, 'taskId' | 'createdAt'> = {
      title: taskData.title,
      description: taskData.description || undefined,
      assignees: taskData.assignees,
      startAt: hasTimePeriod ? new Date(`${taskData.startDate}T${taskData.startTime}`).toISOString() : null,
      endAt: hasTimePeriod ? new Date(`${taskData.endDate}T${taskData.endTime}`).toISOString() : new Date(taskData.dueDate).toISOString(),
      taskStatus: taskData.taskStatus,
      taskPriority: taskData.taskPriority,
      subtasks: taskData.subtasks.length ? taskData.subtasks : undefined,
      attachments: taskData.attachments.length ? taskData.attachments : undefined,
      eventId: eventId ?? null,
    };

    onCreateTask?.(finalTask);

    // Reset form
    setTaskData({
      title: '',
      description: '',
      assignees: isPersonal ? [currentUser] : [],
      dueDate: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      taskStatus: 'To Do',
      taskPriority: 'Normal',
      subtasks: [],
      attachments: [],
    });
    setHasTimePeriod(false);
    setNewAttachmentUrl('');
    onClose();
  };

  // Sub-tasks
  const addSubTask = () => setTaskData(prev => ({ ...prev, subtasks: [...prev.subtasks, { subtaskId: `st_${Date.now()}`, title: '', subtaskStatus: 'To Do', taskId: '' }] }));
  const updateSubTask = (index: number, name: string) => setTaskData(prev => ({ ...prev, subtasks: prev.subtasks.map((st, i) => i === index ? { ...st, title: name } : st) }));
  const removeSubTask = (index: number) => setTaskData(prev => ({ ...prev, subtasks: prev.subtasks.filter((_, i) => i !== index) }));

  // Assignees
  const handleAssigneeToggle = (member: UserLite) => {
    setTaskData(prev => {
      const isAlreadyAssigned = prev.assignees.some(a => a.userId === member.userId);
      if (isPersonal && member.userId === currentUser.userId && isAlreadyAssigned && prev.assignees.length === 1) return prev;
      return { ...prev, assignees: isAlreadyAssigned ? prev.assignees.filter(a => a.userId !== member.userId) : [...prev.assignees, member] };
    });
  };
  const removeAssignee = (member: UserLite) => {
    setTaskData(prev => (isPersonal && member.userId === currentUser.userId ? prev : { ...prev, assignees: prev.assignees.filter(a => a.userId !== member.userId) }));
  };

  // Attachments
  const addAttachment = () => {
    if (!newAttachmentUrl.trim()) return;
    const newAttachment: Attachment = {
      attachmentId: `att_${Date.now()}`,
      attachmentUrl: newAttachmentUrl.trim(),
      taskId: ''
    };
    setTaskData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
    setNewAttachmentUrl('');
  };
  const removeAttachment = (id: string) => setTaskData(prev => ({ ...prev, attachments: prev.attachments.filter(att => att.attachmentId !== id) }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task and assign it to a team member.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input id="taskName" value={taskData.title} onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter task name" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={taskData.description} onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Enter task description (optional)" />
          </div>

          {/* Time Period / Due Date */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="hasTimePeriod" checked={hasTimePeriod} onChange={e => { const checked = e.target.checked; setHasTimePeriod(checked); if (!checked) setTaskData(prev => ({ ...prev, startDate:'', endDate:'', startTime:'', endTime:'' })); }} className="w-4 h-4 text-primary border-border rounded focus:ring-primary" />
              <Label htmlFor="hasTimePeriod" className="text-sm">Schedule task with specific time period</Label>
            </div>
            {hasTimePeriod ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center space-x-2"><Calendar className="w-4 h-4"/><span>Start Date *</span></Label>
                    <Input id="startDate" type="date" value={taskData.startDate} onChange={e => setTaskData(prev => ({ ...prev, startDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center space-x-2"><Calendar className="w-4 h-4"/><span>End Date</span></Label>
                    <Input id="endDate" type="date" value={taskData.endDate} min={taskData.startDate} onChange={e => setTaskData(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center space-x-2"><Clock className="w-4 h-4"/><span>Start Time</span></Label>
                    <Input id="startTime" type="time" value={taskData.startTime} onChange={e => setTaskData(prev => ({ ...prev, startTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="flex items-center space-x-2"><Clock className="w-4 h-4"/><span>End Time</span></Label>
                    <Input id="endTime" type="time" value={taskData.endTime} onChange={e => setTaskData(prev => ({ ...prev, endTime: e.target.value }))} />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center space-x-2"><Calendar className="w-4 h-4"/><span>Due Date</span></Label>
                <Input id="dueDate" type="date" value={taskData.dueDate} onChange={e => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))} />
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2"><Flag className="w-4 h-4"/><span>Priority</span></Label>
            <Select value={taskData.taskPriority} onValueChange={(value: TaskPriority) => setTaskData(prev => ({ ...prev, taskPriority: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Urgent','High','Normal','Low'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={taskData.taskStatus} onValueChange={(value: TaskStatus) => setTaskData(prev => ({ ...prev, taskStatus: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['To Do','In Progress','Done'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sub-tasks</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubTask}><Plus className="w-4 h-4 mr-1"/>Add sub-task</Button>
            </div>
            {taskData.subtasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.subtasks.map((subTask,index)=>(
                  <div key={subTask.subtaskId} className="flex items-center space-x-2">
                    <Input value={subTask.title} onChange={e=>updateSubTask(index,e.target.value)} placeholder="Enter sub-task name" className="flex-1"/>
                    <Button type="button" variant="ghost" size="sm" onClick={()=>removeSubTask(index)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2"><Paperclip className="w-4 h-4"/><span>Attachments</span></Label>
            <div className="flex space-x-2">
              <Input value={newAttachmentUrl} onChange={e=>setNewAttachmentUrl(e.target.value)} placeholder="Paste a link here..." className="flex-1"/>
              <Button type="button" variant="outline" size="sm" onClick={addAttachment} disabled={!newAttachmentUrl.trim()}>Add Link</Button>
            </div>
            {taskData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.attachments.map(att=>(
                  <div key={att.attachmentId} className="flex items-center justify-between p-2 rounded-md border bg-background/60 dark:bg-muted/40">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">{att.attachmentUrl}</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={()=>window.open(att.attachmentUrl,"_blank")} className="shrink-0"><ExternalLink className="w-3 h-3"/></Button>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={()=>removeAttachment(att.attachmentId)} className="text-destructive hover:text-destructive shrink-0 ml-2"><X className="w-4 h-4"/></Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2"><Users className="w-4 h-4"/><span>Assignees *</span></Label>
            {taskData.assignees.length>0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {taskData.assignees.map(a=>(
                  <Badge key={a.userId} variant="secondary" className="flex items-center space-x-1">
                    <span>{a.username}</span>
                    <button type="button" onClick={()=>removeAssignee(a)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Available Team Members:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {eventMembers.length>0 ? eventMembers.map(m=>(
                  <button key={m.userId} type="button" onClick={()=>handleAssigneeToggle(m)} className={`text-left p-2 rounded-md border transition-colors ${taskData.assignees.some(a => a.userId === m.userId)||(isPersonal&&m.userId===currentUser.userId)?'bg-primary/10 border-primary text-primary':'bg-white border-border hover:bg-muted/50'}`}>{m.username}</button>
                )):<p className="text-sm text-muted-foreground p-2">No team members available</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!isFormValid()}>Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}