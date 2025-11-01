'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Paperclip, CheckSquare, Clock, ChevronDown } from "lucide-react";

import { Task, TaskStatus, TaskPriority, UserLite, Subtask } from "@/lib/types";
import { useKanbanStore } from "@/stores/kanban-store";
import { AttachmentList } from "./AttachmentList";
import { formatTaskDateRangeCompact, isCurrentlyActive, extractDateAndTime } from "@/lib/timeUtils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskAction?: (taskId: string, action: "edit" | "reassign" | "setDueDate" | "delete") => void;
}

export function KanbanBoard({ tasks, onTaskStatusChange, onTaskAction }: KanbanBoardProps) {
  const { customization: settings } = useKanbanStore();

  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: "To Do", title: "To Do", color: "bg-muted" },
    { status: "In Progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/30" },
    { status: "Done", title: "Done", color: "bg-green-50 dark:bg-green-900/30" },
  ];

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "Urgent": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Normal": return "bg-blue-500";
      case "Low": return "bg-gray-500";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "Done": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    }
  };

  const getCompletedSubTasks = (subTasks?: Subtask[]) => {
    if (!subTasks) return null;
    return `${subTasks.filter(st => st.subtaskStatus === 'Done').length}/${subTasks.length}`;
  };

  const handleCardClick = (taskId: string) => onTaskAction?.(taskId, "edit");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(column => {
        const columnTasks = tasks.filter(task => task.taskStatus === column.status);

        return (
          <div key={column.status} className="flex flex-col">
            <div className={`${column.color} rounded-lg p-4 mb-4`}>
              <h3 className="font-medium">{column.title}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                {columnTasks.length} task{columnTasks.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {columnTasks.map(task => (
                <Card key={task.taskId} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(task.taskId)}>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h4 className="font-medium mb-2 line-clamp-2">{task.title}</h4>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Badge variant="secondary" className={`cursor-pointer flex items-center gap-1 w-fit ${getStatusColor(task.taskStatus)}`}>
                            {task.taskStatus} <ChevronDown className="w-3 h-3" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-32">
                          {["To Do","In Progress","Done"].map(s => (
                            <DropdownMenuItem
                              key={s}
                              onClick={e => { e.stopPropagation(); onTaskStatusChange?.(task.taskId, s as TaskStatus); }}
                              className={`cursor-pointer ${task.taskStatus === s ? "bg-muted" : ""}`}
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      {settings.showPriority && (
                        <Badge variant="secondary" className={`${getPriorityColor(task.taskPriority)} text-white`}>
                          {task.taskPriority}
                        </Badge>
                      )}

                      {settings.showDueDates && (() => {
                        const { date: taskStartDate, time: taskStartTime } = extractDateAndTime(task.startAt);
                        const { date: taskEndDate, time: taskEndTime } = extractDateAndTime(task.endAt);
                        const taskWithDueDate: Task & { dueDate?: string | null } = task;
                        const { date: taskDueDate } = extractDateAndTime(taskWithDueDate.dueDate ?? undefined);

                        const timeRange = formatTaskDateRangeCompact({
                          startDate: taskStartDate || undefined,
                          endDate: taskEndDate || undefined,
                          startTime: taskStartTime || undefined,
                          endTime: taskEndTime || undefined,
                          dueDate: taskDueDate || undefined,
                        });
                        const isActive = isCurrentlyActive({
                          startDate: taskStartDate || undefined,
                          endDate: taskEndDate || undefined,
                          startTime: taskStartTime || undefined,
                          endTime: taskEndTime || undefined,
                        });
                        if (!timeRange) return null;
                        return (
                          <div className="text-xs">
                            <div className={`flex items-center gap-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{timeRange}</span>
                              {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 ml-1"></div>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {(settings.showSubTaskProgress || settings.showAttachments) && (
                      <div className="flex items-center gap-3 mb-3">
                        {settings.showSubTaskProgress && task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            {getCompletedSubTasks(task.subtasks)}
                          </div>
                        )}

                        {settings.showAttachments && task.attachments && task.attachments.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto w-auto p-1 hover:bg-muted/50 rounded" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  {task.attachments.length}
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <AttachmentList attachments={task.attachments} compact />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}

                    {settings.showAssignees && task.assignees && task.assignees.length > 0 && (
                      <div className="flex items-center">
                        <div className="flex space-x-1">
                          {task.assignees.slice(0,3).map((assignee,index) => (
                            <Avatar key={index} className="w-6 h-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {assignee.username.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">+{task.assignees.length-3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks in {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}