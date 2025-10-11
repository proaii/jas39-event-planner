import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Paperclip, CheckSquare, Calendar, ChevronDown, Clock } from 'lucide-react';
import { AttachmentList } from './AttachmentList';
import { formatTaskDateRangeCompact, isCurrentlyActive } from '../utils/timeUtils';

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

interface BoardCustomization {
  showAssignees: boolean;
  showDueDates: boolean;
  showPriority: boolean;
  showSubTaskProgress: boolean;
  showAttachments: boolean;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onTaskAction?: (taskId: string, action: 'edit' | 'reassign' | 'setDueDate' | 'delete') => void;
  customization?: BoardCustomization;
}

export function KanbanBoard({ tasks, onTaskStatusChange, onTaskAction, customization }: KanbanBoardProps) {
  // Default customization settings if not provided
  const defaultCustomization: BoardCustomization = {
    showAssignees: true,
    showDueDates: true,
    showPriority: true,
    showSubTaskProgress: true,
    showAttachments: true
  };
  
  const settings = customization || defaultCustomization;
  const columns: { status: Task['status']; title: string; color: string }[] = [
    { status: 'To Do', title: 'To Do', color: 'bg-muted' },
    { status: 'In Progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/30' },
    { status: 'Done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/30' },
  ];

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Normal': return 'bg-blue-500';
      case 'Low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getCompletedSubTasks = (subTasks?: SubTask[]) => {
    if (!subTasks) return null;
    const completed = subTasks.filter(st => st.completed).length;
    return `${completed}/${subTasks.length}`;
  };

  const handleCardClick = (taskId: string) => {
    onTaskAction?.(taskId, 'edit');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        
        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div className={`${column.color} rounded-lg p-4 mb-4`}>
              <h3 className="font-medium">{column.title}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3">
              {columnTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCardClick(task.id)}
                >
                  <CardContent className="p-4">
                    {/* Task Name and Status Badge */}
                    <div className="mb-3">
                      <h4 className="font-medium mb-2 line-clamp-2">{task.name}</h4>
                      
                      {/* Interactive Status Badge */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Badge 
                            variant="secondary" 
                            className={`cursor-pointer transition-opacity flex items-center gap-1 w-fit ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                            <ChevronDown className="w-3 h-3" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-32" style={{ zIndex: 9999 }}>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskStatusChange?.(task.id, 'To Do');
                            }}
                            className={`cursor-pointer ${task.status === 'To Do' ? 'bg-muted' : ''}`}
                          >
                            To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskStatusChange?.(task.id, 'In Progress');
                            }}
                            className={`cursor-pointer ${task.status === 'In Progress' ? 'bg-muted' : ''}`}
                          >
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskStatusChange?.(task.id, 'Done');
                            }}
                            className={`cursor-pointer ${task.status === 'Done' ? 'bg-muted' : ''}`}
                          >
                            Done
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Priority Badge and Time Period */}
                    <div className="flex items-center justify-between mb-3">
                      {settings.showPriority && (
                        <Badge 
                          variant="secondary" 
                          className={`${getPriorityColor(task.priority)} text-white`}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      
                      {/* Time Period Display */}
                      {settings.showDueDates && (() => {
                        const timeRangeInfo = formatTaskDateRangeCompact(task);
                        const isActive = isCurrentlyActive(task);
                        
                        if (timeRangeInfo) {
                          return (
                            <div className="text-xs">
                              <div className={`flex items-center gap-1 ${
                                isActive 
                                  ? 'text-primary font-medium' 
                                  : 'text-muted-foreground'
                              }`}>
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{timeRangeInfo}</span>
                                {isActive && (
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 ml-1"></div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        return null;
                      })()}
                    </div>

                    {/* Task Indicators */}
                    {(settings.showSubTaskProgress || settings.showAttachments) && (
                      <div className="flex items-center gap-3 mb-3">
                        {/* Sub-tasks indicator */}
                        {settings.showSubTaskProgress && task.subTasks && task.subTasks.length > 0 && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            {getCompletedSubTasks(task.subTasks)}
                          </div>
                        )}

                        {/* Attachments indicator */}
                        {settings.showAttachments && task.attachments && task.attachments.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto w-auto p-1 hover:bg-muted/50 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  {task.attachments.length}
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 z-50" align="start">
                              <AttachmentList attachments={task.attachments} compact={true} />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}

                    {/* Assignees */}
                    {settings.showAssignees && task.assignees.length > 0 && (
                      <div className="flex items-center">
                        <div className="flex space-x-1">
                          {task.assignees.slice(0, 3).map((assignee, index) => (
                            <Avatar key={index} className="w-6 h-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {assignee.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                +{task.assignees.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No tasks in {column.title.toLowerCase()}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}