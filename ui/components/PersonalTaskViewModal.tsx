import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { AttachmentList } from './AttachmentList';
import { getEffectiveDueDate } from '../utils/timeUtils';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  CheckSquare, 
  Edit3, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';

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
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean;
}

interface PersonalTaskViewModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string) => void;
}

export function PersonalTaskViewModal({
  isOpen,
  task,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
  onSubTaskToggle
}: PersonalTaskViewModalProps) {
  const [showSubTasks, setShowSubTasks] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);

  if (!task) return null;

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Helper function to format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-warning text-warning-foreground';
      case 'Normal':
        return 'bg-primary/20 text-primary';
      case 'Low':
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return 'bg-secondary/20 text-secondary hover:bg-secondary/30';
      case 'In Progress':
        return 'bg-warning/20 text-warning hover:bg-warning/30';
      case 'To Do':
        return 'bg-muted text-muted-foreground hover:bg-muted/70';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-6">
              <DialogTitle className="text-xl text-foreground mb-2">
                {task.name}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800 border-0">
                  <User className="w-3 h-3 mr-1" />
                  Personal Task
                </Badge>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(task.id)}
                className="h-8"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(task.id)}
                className="h-8 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Task Description */}
          {task.description && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Status</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${getStatusColor(task.status)}`}>
                    {task.status}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, 'To Do')}
                    className="cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-muted mr-2" />
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, 'In Progress')}
                    className="cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-warning mr-2" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, 'Done')}
                    className="cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-secondary mr-2" />
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Priority</h4>
              <Badge variant="secondary" className={`${getPriorityColor(task.priority)} border-0`}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
            </div>

            {/* Due Date */}
            {(() => {
              const effectiveDueDate = getEffectiveDueDate(task);
              return effectiveDueDate && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Due Date</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDueDate(effectiveDueDate)}
                  </div>
                </div>
              );
            })()}

            {/* Assignee */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Assigned to</h4>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(task.assignees[0])}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{task.assignees[0]}</span>
              </div>
            </div>
          </div>

          {/* Sub-tasks */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowSubTasks(!showSubTasks)}
                className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors mb-3"
              >
                {showSubTasks ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <CheckSquare className="w-4 h-4" />
                <span>Sub-tasks ({task.subTasks.filter(st => st.completed).length}/{task.subTasks.length})</span>
              </button>

              {showSubTasks && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {task.subTasks.map((subTask) => (
                      <div key={subTask.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={subTask.completed}
                          onCheckedChange={() => onSubTaskToggle(task.id, subTask.id)}
                        />
                        <span className={`text-sm flex-1 ${subTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {subTask.name}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <button
                onClick={() => setShowAttachments(!showAttachments)}
                className="flex items-center space-x-2 font-medium text-foreground hover:text-primary transition-colors mb-3"
              >
                {showAttachments ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>📎 Attachments ({task.attachments.length})</span>
              </button>

              {showAttachments && (
                <Card>
                  <CardContent className="p-4">
                    <AttachmentList attachments={task.attachments} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={task.status === 'Done'}
                onCheckedChange={(checked) => {
                  onStatusChange(task.id, checked ? 'Done' : 'To Do');
                }}
              />
              <span className="text-sm text-muted-foreground">
                Mark as {task.status === 'Done' ? 'incomplete' : 'complete'}
              </span>
            </div>
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}