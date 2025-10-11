import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CheckSquare, MoreVertical, Eye, Edit3, CheckCircle2, Flag, Paperclip, ChevronDown, ChevronRight, Trash2, Clock, Calendar } from 'lucide-react';
import { AttachmentList } from './AttachmentList';
import { formatTaskDateRange, isCurrentlyActive, calculateDuration, getEffectiveDueDate } from '../utils/timeUtils';

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
  eventTitle?: string;
}

interface TaskCardProps {
  task: Task;
  onTaskAction?: (taskId: string, action: 'view' | 'complete' | 'edit' | 'delete') => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  formatDueDate?: (dueDate?: string) => { text: string; isUrgent: boolean; isToday: boolean; isTomorrow: boolean } | null;
}

export function TaskCard({ task, onTaskAction, onStatusChange, onSubTaskToggle, formatDueDate }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Normal': return 'text-blue-500';
      case 'Low': return 'text-gray-400';
      default: return 'text-blue-500';
    }
  };

  const effectiveDueDate = getEffectiveDueDate(task);
  const dueDateInfo = formatDueDate?.(effectiveDueDate);
  const timeRangeInfo = formatTaskDateRange(task);
  const isActive = isCurrentlyActive(task);
  const duration = task.startDate && task.endDate ? calculateDuration(task.startDate, task.endDate, task.startTime, task.endTime) : null;

  const handleTaskRowClick = () => {
    if (task.subTasks && task.subTasks.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    onSubTaskToggle?.(task.id, subTaskId);
  };

  return (
    <div className="space-y-2">
      <div 
        className={`group flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
          task.subTasks && task.subTasks.length > 0 ? 'cursor-pointer' : ''
        }`}
        onClick={handleTaskRowClick}
      >
        {/* Expansion chevron for tasks with sub-tasks */}
        <div className="flex-shrink-0 w-4">
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <p className={`font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.name}
          </p>
          {/* Attachments indicator */}
          {task.attachments && task.attachments.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0.5 hover:bg-muted/50 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Paperclip className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <AttachmentList attachments={task.attachments} compact={true} />
              </PopoverContent>
            </Popover>
          )}
          {/* Priority indicator */}
          <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
        </div>
        
        {/* Event title or Personal task indicator */}
        {task.eventTitle ? (
          <p className="text-sm text-muted-foreground">
            {task.eventTitle}
          </p>
        ) : task.isPersonal ? (
          <p className="text-sm text-muted-foreground italic">
            Personal Task
          </p>
        ) : null}
        
        {/* Sub-task progress */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <CheckSquare className="w-3 h-3" />
            <span>
              {task.subTasks.filter(st => st.completed).length} of {task.subTasks.length} completed
            </span>
          </div>
        )}
        
        {/* Time period information */}
        {timeRangeInfo && (
          <div className="flex items-center space-x-2 text-sm mt-1">
            <div className={`flex items-center space-x-1 ${
              isActive 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{timeRangeInfo}</span>
            </div>
            {isActive && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Active
              </Badge>
            )}
          </div>
        )}
        
        {/* Duration indicator for multi-day tasks */}
        {duration && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <Calendar className="w-3 h-3" />
            <span>Duration: {duration}</span>
          </div>
        )}

        {/* Fallback to due date if no time range */}
        {!timeRangeInfo && dueDateInfo && (
          <p className={`text-sm mt-1 ${
            dueDateInfo.isUrgent 
              ? 'text-warning font-medium' 
              : 'text-muted-foreground'
          }`}>
            {dueDateInfo.text}
          </p>
        )}
      </div>

      {/* Interactive Status Badge */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Badge 
            variant="secondary" 
            className={`cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
              task.status === 'To Do' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''
            } ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''} ${
              task.status === 'Done' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
            }`}
          >
            {task.status}
            <ChevronDown className="w-3 h-3" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32" style={{ zIndex: 9999 }}>
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.(task.id, 'To Do');
            }}
            className={`cursor-pointer ${task.status === 'To Do' ? 'bg-muted' : ''}`}
          >
            To Do
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.(task.id, 'In Progress');
            }}
            className={`cursor-pointer ${task.status === 'In Progress' ? 'bg-muted' : ''}`}
          >
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange?.(task.id, 'Done');
            }}
            className={`cursor-pointer ${task.status === 'Done' ? 'bg-muted' : ''}`}
          >
            Done
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Task Kebab Menu - Only show on group hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onTaskAction?.(task.id, 'view');
              }} 
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              {task.isPersonal ? 'View Task Details' : 'View Task in Event'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.(task.id, 'Done');
              }} 
              className="cursor-pointer"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Complete
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onTaskAction?.(task.id, 'edit');
              }} 
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onTaskAction?.(task.id, 'delete');
              }} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {/* Expanded Sub-tasks */}
    {isExpanded && task.subTasks && task.subTasks.length > 0 && (
      <div className="ml-8 pl-4 py-2 bg-muted/30 rounded-lg border-l-2 border-primary/20">
        <div className="space-y-2">
          {task.subTasks.map((subTask) => (
            <div key={subTask.id} className="flex items-center space-x-3">
              <Checkbox
                checked={subTask.completed}
                onCheckedChange={() => handleSubTaskToggle(subTask.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className={`text-sm ${subTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {subTask.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
}