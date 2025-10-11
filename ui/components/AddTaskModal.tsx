import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar, Users, X, Plus, Trash2, Flag, Paperclip, ExternalLink, Clock } from 'lucide-react';

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
  name: string;
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
  eventMembers: string[];
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

export function AddTaskModal({ isOpen, eventMembers, onClose, onAddTask }: AddTaskModalProps) {
  const [taskData, setTaskData] = useState({
    name: '',
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
    attachments: [] as Attachment[]
  });
  const [hasTimePeriod, setHasTimePeriod] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskData.name && taskData.assignees.length > 0) {
      onAddTask({
        ...taskData,
        dueDate: taskData.dueDate || undefined,
        startDate: taskData.startDate || undefined,
        endDate: taskData.endDate || undefined,
        startTime: taskData.startTime || undefined,
        endTime: taskData.endTime || undefined,
        description: taskData.description || undefined,
        subTasks: taskData.subTasks.length > 0 ? taskData.subTasks : undefined,
        attachments: taskData.attachments.length > 0 ? taskData.attachments : undefined
      });
      setTaskData({ 
        name: '', 
        description: '',
        assignees: [], 
        dueDate: '', 
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        status: 'To Do',
        priority: 'Normal',
        subTasks: [],
        attachments: []
      });
      setHasTimePeriod(false);
      setNewAttachmentUrl('');
      onClose();
    }
  };

  const addSubTask = () => {
    const newSubTask: SubTask = {
      id: `st_${Date.now()}`,
      name: '',
      completed: false
    };
    setTaskData(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, newSubTask]
    }));
  };

  const updateSubTask = (index: number, name: string) => {
    setTaskData(prev => ({
      ...prev,
      subTasks: prev.subTasks.map((st, i) => 
        i === index ? { ...st, name } : st
      )
    }));
  };

  const removeSubTask = (index: number) => {
    setTaskData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter((_, i) => i !== index)
    }));
  };

  const handleAssigneeToggle = (member: string) => {
    setTaskData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(member)
        ? prev.assignees.filter(a => a !== member)
        : [...prev.assignees, member]
    }));
  };

  const removeAssignee = (member: string) => {
    setTaskData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(a => a !== member)
    }));
  };

  const addAttachment = () => {
    if (newAttachmentUrl.trim()) {
      const newAttachment: Attachment = {
        id: `att_${Date.now()}`,
        url: newAttachmentUrl.trim(),
        title: extractTitleFromUrl(newAttachmentUrl.trim()),
        favicon: getFaviconFromUrl(newAttachmentUrl.trim())
      };
      setTaskData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      setNewAttachmentUrl('');
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setTaskData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
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
              value={taskData.name}
              onChange={(e) => setTaskData(prev => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
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
                    setTaskData(prev => ({ 
                      ...prev, 
                      startDate: '',
                      endDate: '',
                      startTime: '',
                      endTime: ''
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
                    <Label htmlFor="startDate" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date *</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={taskData.startDate}
                      onChange={(e) => setTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                      required={hasTimePeriod}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>End Date</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={taskData.endDate}
                      onChange={(e) => setTaskData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={taskData.startDate}
                    />
                  </div>
                </div>

                {/* Start and End Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Start Time</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={taskData.startTime}
                      onChange={(e) => setTaskData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>End Time</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={taskData.endTime}
                      onChange={(e) => setTaskData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Fallback to simple due date */
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
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
            <Select value={taskData.priority} onValueChange={(value: Task['priority']) => setTaskData(prev => ({ ...prev, priority: value }))}>
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
            <Select value={taskData.status} onValueChange={(value: Task['status']) => setTaskData(prev => ({ ...prev, status: value }))}>
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
              <Button type="button" variant="outline" size="sm" onClick={addSubTask}>
                <Plus className="w-4 h-4 mr-1" />
                Add sub-task
              </Button>
            </div>
            {taskData.subTasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.subTasks.map((subTask, index) => (
                  <div key={subTask.id} className="flex items-center space-x-2">
                    <Input
                      value={subTask.name}
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
            {taskData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {taskData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-lg">{attachment.favicon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{attachment.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{attachment.url}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
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
            
            {/* Selected Assignees */}
            {taskData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {taskData.assignees.map((assignee) => (
                  <Badge key={assignee} variant="secondary" className="flex items-center space-x-1">
                    <span>{assignee}</span>
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
                {eventMembers && eventMembers.length > 0 ? eventMembers.map((member) => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => handleAssigneeToggle(member)}
                    className={`text-left p-2 rounded-md border transition-colors ${
                      taskData.assignees.includes(member)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-border hover:bg-muted/50'
                    }`}
                  >
                    {member}
                  </button>
                )) : (
                  <p className="text-sm text-muted-foreground p-2">No team members available</p>
                )}
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
              disabled={!taskData.name || taskData.assignees.length === 0}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}