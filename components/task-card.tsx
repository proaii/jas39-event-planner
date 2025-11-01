'use client';
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Flag,
  Paperclip,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { AttachmentList } from "./attachment-list";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task["taskStatus"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onSubTaskToggle }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "Urgent":
        return "text-red-500";
      case "High":
        return "text-orange-500";
      case "Normal":
        return "text-blue-500";
      case "Low":
      default:
        return "text-gray-400";
    }
  };

  const handleTaskRowClick = () => {
    if (task.subtasks && task.subtasks.length > 0) {
      setIsExpanded((s) => !s);
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    onSubTaskToggle?.(task.taskId, subTaskId);
  };

  const completedCount =
    task.subtasks?.filter((st) => st.subtaskStatus === "Done").length ?? 0;

  return (
    <div>
      <div
        className={`group flex items-center py-2 rounded-lg hover:bg-muted/50 transition-colors ${
          task.subtasks && task.subtasks.length > 0 ? "cursor-pointer" : ""
        }`}
        onClick={handleTaskRowClick}
      >
        <div className="flex-shrink-0 w-4">
          {task.subtasks && task.subtasks.length > 0 && (
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
            <p
              className={`font-medium ${
                task.taskStatus === "Done"
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
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
                  <AttachmentList attachments={task.attachments} compact />
                </PopoverContent>
              </Popover>
            )}

            <Flag className={`w-3 h-3 ${getPriorityColor(task.taskPriority)}`} />
          </div>

          {task.eventTitle ? (
            <p className="text-sm text-muted-foreground">{task.eventTitle}</p>
          ) : task.eventId === null ? (
            <p className="text-sm text-muted-foreground italic">Personal Task</p>
          ) : null}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedCount} of {task.subtasks.length} completed
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Badge
              variant="secondary"
              className={`cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1
                ${
                  task.taskStatus === "To Do"
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    : ""
                }
                ${
                  task.taskStatus === "In Progress"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : ""
                }
                ${
                  task.taskStatus === "Done"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : ""
                }`}
            >
              {task.taskStatus}
              <ChevronDown className="w-3 h-3" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32" style={{ zIndex: 9999 }}>
            {(["To Do", "In Progress", "Done"] as TaskStatus[]).map((st) => (
              <DropdownMenuItem
                key={st}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task.taskId, st);
                }}
                className={`cursor-pointer ${
                  task.taskStatus === st ? "bg-muted" : ""
                }`}
              >
                {st}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-8 pl-4 py-2 bg-muted/30 rounded-lg border-l-2 border-primary/20">
          <div className="space-y-2">
            {task.subtasks.map((subTask) => (
              <div key={subTask.subtaskId} className="flex items-center space-x-3">
                <Checkbox
                  checked={subTask.subtaskStatus === "Done"}
                  onCheckedChange={() => handleSubTaskToggle(subTask.subtaskId)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={`text-sm ${
                    subTask.subtaskStatus === "Done"
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {subTask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}