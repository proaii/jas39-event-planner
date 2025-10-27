"use client";
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CheckSquare, Flag, Paperclip, ChevronDown, ChevronRight } from 'lucide-react';
import { AttachmentList } from './attachment-list';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onSubTaskToggle }: TaskCardProps) {
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

  const handleTaskRowClick = () => {
    if (task.subTasks && task.subTasks.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    onSubTaskToggle?.(task.id, subTaskId);
  };

  return (
    <div>
      <div 
        className={`group flex items-center py-2 rounded-lg hover:bg-muted/50 transition-colors ${
          task.subTasks && task.subTasks.length > 0 ? 'cursor-pointer' : ''
        }`}
        onClick={handleTaskRowClick}
      >
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
          <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
        </div>
        
        {task.eventTitle ? (
          <p className="text-sm text-muted-foreground">
            {task.eventTitle}
          </p>
        ) : task.isPersonal ? (
          <p className="text-sm text-muted-foreground italic">
            Personal Task
          </p>
        ) : null}
        
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <CheckSquare className="w-3 h-3" />
            <span>
              {task.subTasks.filter(st => st.completed).length} of {task.subTasks.length} completed
            </span>
          </div>
        )}
        
      </div>

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
    </div>

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