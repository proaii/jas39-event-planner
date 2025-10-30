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

interface SubTask { id: string; name: string; completed: boolean; }
interface Attachment { id: string; url: string; title: string; favicon?: string; }

interface Task {
  title: string;
  description?: string;
  assignees: string[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean;
}

interface AddTaskModalProps {
  isOpen: boolean;
  eventMembers?: string[];
  currentUser: string;
  isPersonal?: boolean;
  onClose: () => void;
  onAddTask?: (task: Task) => void;
  onCreateTask?: (task: Omit<Task, 'status' | 'createdAt'>) => void;
}

export function AddTaskModal({
  isOpen,
  eventMembers = [],
  currentUser,
  isPersonal = false,
  onClose,
  onAddTask,
  onCreateTask,
}: AddTaskModalProps) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignees: [] as string[],
    dueDate: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    status: 'To Do' as Task['status'],
    priority: 'Normal' as Task['priority'],
    subTasks: [] as SubTask[],
    attachments: [] as Attachment[],
  });
  const [hasTimePeriod, setHasTimePeriod] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (isPersonal) setTaskData(prev => ({ ...prev, assignees: [currentUser] }));
  }, [isPersonal, currentUser]);

  const isFormValid = () => {
    if (!taskData.title.trim()) return false;
    if (!taskData.priority || !taskData.status) return false;
    if (!isPersonal && taskData.assignees.length === 0) return false;
    if (hasTimePeriod) {
      if (!taskData.startDate || !taskData.endDate || !taskData.startTime || !taskData.endTime) return false;
    } else if (!taskData.dueDate) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const finalTask: Task = {
      title: taskData.title,
      description: taskData.description || undefined,
      assignees: taskData.assignees,
      dueDate: !hasTimePeriod ? taskData.dueDate || undefined : undefined,
      startDate: hasTimePeriod ? taskData.startDate || undefined : undefined,
      endDate: hasTimePeriod ? taskData.endDate || undefined : undefined,
      startTime: hasTimePeriod ? taskData.startTime || undefined : undefined,
      endTime: hasTimePeriod ? taskData.endTime || undefined : undefined,
      status: taskData.status,
      priority: taskData.priority,
      subTasks: taskData.subTasks.length ? taskData.subTasks : undefined,
      attachments: taskData.attachments.length ? taskData.attachments : undefined,
      isPersonal: isPersonal || undefined,
    };

    if (isPersonal) onCreateTask?.(finalTask);
    else onAddTask?.(finalTask);

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
      status: 'To Do',
      priority: 'Normal',
      subTasks: [],
      attachments: [],
    });
    setHasTimePeriod(false);
    setNewAttachmentUrl('');
    onClose();
  };

  // Sub-tasks
  const addSubTask = () => setTaskData(prev => ({ ...prev, subTasks: [...prev.subTasks, { id: `st_${Date.now()}`, name: '', completed: false }] }));
  const updateSubTask = (index: number, name: string) => setTaskData(prev => ({ ...prev, subTasks: prev.subTasks.map((st, i) => i === index ? { ...st, name } : st) }));
  const removeSubTask = (index: number) => setTaskData(prev => ({ ...prev, subTasks: prev.subTasks.filter((_, i) => i !== index) }));

  // Assignees
  const handleAssigneeToggle = (member: string) => {
    setTaskData(prev => {
      const isAlreadyAssigned = prev.assignees.includes(member);
      if (isPersonal && member === currentUser && isAlreadyAssigned && prev.assignees.length === 1) return prev;
      return { ...prev, assignees: isAlreadyAssigned ? prev.assignees.filter(a => a !== member) : [...prev.assignees, member] };
    });
  };
  const removeAssignee = (member: string) => {
    setTaskData(prev => (isPersonal && member === currentUser ? prev : { ...prev, assignees: prev.assignees.filter(a => a !== member) }));
  };

  // Attachments
  const addAttachment = () => {
    if (!newAttachmentUrl.trim()) return;
    const newAttachment: Attachment = {
      id: `att_${Date.now()}`,
      url: newAttachmentUrl.trim(),
      title: extractTitleFromUrl(newAttachmentUrl.trim()),
      favicon: getFaviconFromUrl(newAttachmentUrl.trim()),
    };
    setTaskData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
    setNewAttachmentUrl('');
  };
  const removeAttachment = (id: string) => setTaskData(prev => ({ ...prev, attachments: prev.attachments.filter(att => att.id !== id) }));

  const extractTitleFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('docs.google.com')) return 'Google Doc';
      if (u.hostname.includes('figma.com')) return 'Figma Design';
      if (u.hostname.includes('github.com')) return 'GitHub Repository';
      if (u.hostname.includes('drive.google.com')) return 'Google Drive File';
      return u.hostname.replace('www.', '');
    } catch { return 'Link'; }
  };

  const getFaviconFromUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('docs.google.com')) return '📄';
      if (u.hostname.includes('figma.com')) return '🎨';
      if (u.hostname.includes('github.com')) return '💻';
      if (u.hostname.includes('drive.google.com')) return '📂';
      return '🔗';
    } catch { return '🔗'; }
  };

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
            <Select value={taskData.priority} onValueChange={(value: Task['priority']) => setTaskData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Urgent','High','Normal','Low'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={taskData.status} onValueChange={(value: Task['status']) => setTaskData(prev => ({ ...prev, status: value }))}>
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
            {taskData.subTasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.subTasks.map((subTask,index)=>(
                  <div key={subTask.id} className="flex items-center space-x-2">
                    <Input value={subTask.name} onChange={e=>updateSubTask(index,e.target.value)} placeholder="Enter sub-task name" className="flex-1"/>
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
                  <div key={att.id} className="flex items-center justify-between p-2 rounded-md border bg-background/60 dark:bg-muted/40">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-lg">{att.favicon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">{att.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{att.url}</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={()=>window.open(att.url,"_blank")} className="shrink-0"><ExternalLink className="w-3 h-3"/></Button>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={()=>removeAttachment(att.id)} className="text-destructive hover:text-destructive shrink-0 ml-2"><X className="w-4 h-4"/></Button>
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
                  <Badge key={a} variant="secondary" className="flex items-center space-x-1">
                    <span>{a}</span>
                    <button type="button" onClick={()=>removeAssignee(a)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Available Team Members:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {eventMembers.length>0 ? eventMembers.map(m=>(
                  <button key={m} type="button" onClick={()=>handleAssigneeToggle(m)} className={`text-left p-2 rounded-md border transition-colors ${taskData.assignees.includes(m)||(isPersonal&&m===currentUser)?'bg-primary/10 border-primary text-primary':'bg-white border-border hover:bg-muted/50'}`}>{m}</button>
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
