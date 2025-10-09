import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { CheckSquare, Calendar, Users, X, Flag, Plus, Trash2, Paperclip, ExternalLink, Clock } from 'lucide-react';

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
  id: string;
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

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  eventMembers: string[];
  onClose: () => void;
  onUpdateTask: (taskId: string, taskData: {
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
  }) => void;
}

export function EditTaskModal({ isOpen, task, eventMembers, onClose, onUpdateTask }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
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

  const [availableMembers, setAvailableMembers] = useState<string[]>([]);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        assignees: task.assignees,
        dueDate: task.dueDate || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        status: task.status,
        priority: task.priority || 'Normal',
        subTasks: task.subTasks || [],
        attachments: task.attachments || []
      });
      
      // Determine if task uses time period
      setHasTimePeriod(!!(task.startDate || task.startTime));
    }
    setAvailableMembers(eventMembers);
  }, [task, eventMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    onUpdateTask(task.id, {
      ...formData,
      dueDate: formData.dueDate || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      description: formData.description || undefined,
      subTasks: formData.subTasks.length > 0 ? formData.subTasks : undefined,
      attachments: formData.attachments.length > 0 ? formData.attachments : undefined
    });
    onClose();
  };

  const handleAssigneeToggle = (member: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(member)
        ? prev.assignees.filter(a => a !== member)
        : [...prev.assignees, member]
    }));
  };

  const removeAssignee = (member: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(a => a !== member)
    }));
  };

  const addSubTask = () => {
    const newSubTask: SubTask = {
      id: `st_${Date.now()}`,
      name: '',
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, newSubTask]
    }));
  };

  const updateSubTask = (index: number, field: keyof SubTask, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.map((st, i) => 
        i === index ? { ...st, [field]: value } : st
      )
    }));
  };

  const removeSubTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter((_, i) => i !== index)
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
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      setNewAttachmentUrl('');
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
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
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={formData.startDate}
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
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
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
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
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
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
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
            <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
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
            <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}>
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
            {formData.subTasks.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {formData.subTasks.map((subTask, index) => (
                  <div key={subTask.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      onChange={(e) => updateSubTask(index, 'completed', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Input
                      value={subTask.name}
                      onChange={(e) => updateSubTask(index, 'name', e.target.value)}
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
            {formData.attachments.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {formData.attachments.map((attachment) => (
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
              <span>Assignees</span>
            </Label>
            
            {/* Selected Assignees */}
            {formData.assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {formData.assignees.map((assignee) => (
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
                {availableMembers.map((member) => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => handleAssigneeToggle(member)}
                    className={`text-left p-2 rounded-md border transition-colors ${
                      formData.assignees.includes(member)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-border hover:bg-muted/50'
                    }`}
                  >
                    {member}
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
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}