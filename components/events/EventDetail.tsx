'use client';

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Share,
  Trash2,
  Plus,
  TrendingUp,
  CheckSquare,
  MoreVertical,
  Flag,
  Clock,
  Calendar,
  MapPin,
  Users,
  ListTodo,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Image,
  Loader2,
  Download,
} from "lucide-react";

import NextImage from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createEvent, EventAttributes } from 'ics';

import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { KanbanBoard } from "@/components/events/KanbanBoard";
import type { Event, Task, TaskStatus, TaskPriority, UserLite, Subtask } from "@/lib/types";
import { useUiStore } from "@/stores/ui-store";
import { useEventViewStore } from "@/stores/eventViewStore";
import { useEventDetailStore } from "@/stores/Eventdetailstore";

// React Query Hooks
import { useFetchEventTasks, useEditTask, useCreateEventTask, useUpdateSubtaskStatus } from "@/lib/client/features/tasks/hooks";
import { useDeleteEvent } from "@/lib/client/features/events/hooks";

interface EventDetailProps {
  event: Event;
  tasks: Task[];
  currentUser: UserLite;
  allUsers: UserLite[];
  onBack: () => void;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (task: Omit<Task, "taskId" | "createdAt">) => void;
  onTaskAction?: (taskId: string, action: "edit" | "reassign" | "setDueDate" | "delete") => void;
  onDeleteEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onTaskClick?: (taskId: string) => void; 
}

interface TaskPage {
  items: Task[];
}

interface InfiniteTaskData {
  pages?: TaskPage[];
}

const safeDate = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null;

const safeTimeString = (value: string | null | undefined): string => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toTimeString().substring(0, 5);
};

export function EventDetail({
  event,
  tasks: allTasks,
  currentUser,
  allUsers,
  onBack,
  onDeleteEvent,
  onEditEvent,
  onTaskClick, // ⭐ Receive the prop
}: EventDetailProps) {
  // ==================== STORES ====================
  const { 
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
  } = useUiStore();
  
  const { currentView } = useEventViewStore();

  const {
    showDeleteDialog,
    setShowDeleteDialog,
    sortBy,
    setSortBy,
    expandedTaskId,
    toggleTaskExpansion,
    showCoverImage,
    setShowCoverImage,
  } = useEventDetailStore();

  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null);

  const userMap = useMemo(() => {
    const map = new Map<string, UserLite>();
    allUsers.forEach((u) => map.set(u.userId, u));
    return map;
  }, [allUsers]);

  // ==================== REACT QUERY ====================
  const tasksQuery = useFetchEventTasks({ 
    eventId: event.eventId, 
    pageSize: 100 
  });
  
  const isTasksLoading = tasksQuery.isLoading;
  
  const editTaskMutation = useEditTask();
  const createTaskMutation = useCreateEventTask(event.eventId);
  const deleteEventMutation = useDeleteEvent();
  const updateSubtaskMutation = useUpdateSubtaskStatus();

  // ==================== COMPUTED VALUES ====================
  // Use API data if available, otherwise fallback to props
  const apiTasks = tasksQuery.data ? 
    (tasksQuery.data as InfiniteTaskData).pages?.flatMap((page: TaskPage) => page.items) : 
    undefined;
  const tasks = apiTasks ?? (allTasks?.filter((t: Task) => t.eventId === event.eventId) || []);
  const members = event.members || [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.taskStatus === "Done").length;
  const inProgressTasks = tasks.filter((t: Task) => t.taskStatus === "In Progress").length;
  const todoTasks = tasks.filter((t: Task) => t.taskStatus === "To Do").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ==================== HANDLERS ====================
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await editTaskMutation.mutateAsync({
        taskId,
        patch: { taskStatus: newStatus }
      });
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    }
  };

  const handleSubtaskStatusChange = async (taskId: string, subtaskId: string, currentStatus: string) => {
    if (updatingSubtaskId === subtaskId) return;
    
    // 1. Find the parent task to calculate the current list of subtasks
    const task = tasks.find(t => t.taskId === taskId);
    if (!task || !task.subtasks) return;

    // Toggle Logic: If Done, go back to To Do, if not Done, go to Done.
    const newSubtaskStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    
    setUpdatingSubtaskId(subtaskId);

    try {
      // 2. Update the ticked subtask first.
      await updateSubtaskMutation.mutateAsync({ 
        subtaskId, 
        status: newSubtaskStatus 
      });

      // 3. Simulate new Subtasks to calculate the Parent state (Client-side Calculation)
      const updatedSubtasks = task.subtasks.map(sub => 
        sub.subtaskId === subtaskId ? { ...sub, subtaskStatus: newSubtaskStatus } : sub
      );

      // 4. Parent Task Conditions
      const totalSubtasks = updatedSubtasks.length;
      const doneCount = updatedSubtasks.filter(s => s.subtaskStatus === 'Done').length;
      const inProgressCount = updatedSubtasks.filter(s => s.subtaskStatus === 'In Progress').length;
      
      let newParentStatus: TaskStatus = 'To Do';

      if (totalSubtasks > 0) {
        if (doneCount === totalSubtasks) {
          // If all Subtasks == Done
          newParentStatus = 'Done';
        } else if (doneCount > 0 || inProgressCount > 0) {
          // If some are Done or In Progress
          newParentStatus = 'In Progress';
        } else {
          // If none of them are Done or In Progress
          newParentStatus = 'To Do';
        }
      }

      // 5. If the Parent status changes from the original, fire the API to update the Parent Task.
      if (newParentStatus !== task.taskStatus) {
        await editTaskMutation.mutateAsync({
          taskId,
          patch: { taskStatus: newParentStatus }
        });
        toast.success(`Task updated to ${newParentStatus}`);
      }

    } catch { 
      toast.error('Failed to update subtask')
    } finally {
      setUpdatingSubtaskId(null) 
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEventMutation.mutateAsync(event.eventId);
      toast.success("Event deleted successfully");
      setShowDeleteDialog(false);
      onBack();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  const downloadIcsFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadIcs = () => {
    if (!event.startAt || !event.endAt) {
      toast.error("Event start or end time is missing.");
      return;
    }

    const startTime = new Date(event.startAt);
    const endTime = new Date(event.endAt);

    const icsEvent: EventAttributes = {
        title: event.title,
        description: event.description || undefined,
        start: [startTime.getFullYear(), startTime.getMonth() + 1, startTime.getDate(), startTime.getHours(), startTime.getMinutes()],
        end: [endTime.getFullYear(), endTime.getMonth() + 1, endTime.getDate(), endTime.getHours(), endTime.getMinutes()],
        location: event.location || undefined,
        organizer: { name: currentUser.username, email: currentUser.email },
    };

    createEvent(icsEvent, (error, value) => {
        if (error) {
            console.error('Error creating ICS file:', error);
            toast.error("Failed to create ICS file.");
            return;
        }
        downloadIcsFile(value, `${event.title}.ics`);
    });
  };

  // ==================== HELPER FUNCTIONS ====================
  const getInitials = (name: string) =>
    name?.split(" ").map(p => p[0]).join("").toUpperCase() || "";

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "Urgent": return "bg-destructive text-destructive-foreground";
      case "High": return "bg-warning text-warning-foreground";
      case "Normal": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Done": return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      case "In Progress": return "bg-warning/20 text-warning hover:bg-warning/30";
      default: return "bg-muted text-muted-foreground hover:bg-muted/70";
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    if (isNaN(hour)) return "";

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.endAt) return 1;
        if (!b.endAt) return -1;
        return new Date(a.endAt).getTime() - new Date(b.endAt).getTime();
      case "priority": {
        const order: Record<TaskPriority, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
        const aPriority = a.taskPriority as TaskPriority;
        const bPriority = b.taskPriority as TaskPriority;
        return order[aPriority] - order[bPriority];
      }
      case "status": {
        const statusOrder: Record<TaskStatus, number> = { "To Do": 0, "In Progress": 1, Done: 2 };
        const aStatus = a.taskStatus as TaskStatus;
        const bStatus = b.taskStatus as TaskStatus;
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      default:
        return a.title?.localeCompare(b.title) || 0;
    }
  });

  if (!event) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-muted/20 border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">{event.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEditEvent?.(event.eventId)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Event
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadIcs}>
                <Download className="w-4 h-4 mr-2" /> Download ICS
              </Button>
              {onDeleteEvent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteEventMutation.isPending}
                >
                  {deleteEventMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cover Image */}
            {showCoverImage && event.coverImageUri && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="relative">
                  <div className="aspect-video">
                    <NextImage
                      src={event.coverImageUri}
                      alt={`Cover image for ${event.title}`}
                      className="object-cover w-full h-full"
                      width={1080}
                      height={1080}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        setShowCoverImage(false);
                      }}
                    />
                  </div>

                  <div className="absolute top-3 right-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCoverImage(false)}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white"
                    >
                      Hide Photo
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {!showCoverImage && event.coverImageUri && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="py-4">
                    <Image className="w-8 h-8 mx-auto mb-3 text-muted-foreground" aria-label="Image icon" />
                    <Button
                      variant="outline"
                      onClick={() => setShowCoverImage(true)}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Show Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                
                {/* Time */}
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">
                    {event.startAt ? formatTime(safeTimeString(event.startAt)) : ""}
                    {event.endAt ? ` - ${formatTime(safeTimeString(event.endAt))}` : ""}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">
                    {safeDate(event.startAt)?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) || ""}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">{event.location}</span>
                </div>

                {event.description && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm leading-relaxed">{event.description}</p>

                  </div>
                )}
              </CardContent>
            </Card>

            {/* Widgets */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {isTasksLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      `${progressPercentage}%`
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold">{members.length}</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <ListTodo className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <div className="text-2xl font-bold">
                    {isTasksLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      todoTasks + inProgressTasks
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
            </div>

            {/* Members */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.map((memberId: string) => {
                  const user = userMap.get(memberId);
                  const displayName = user ? user.username : memberId;
                  
                  return (
                    <div key={memberId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                            {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{displayName}</span>
                        {user && <span className="text-[10px] text-muted-foreground">{user.email}</span>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-sm">
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Tasks</CardTitle>
                  <div className="flex items-center space-x-2">

                    <ViewSwitcher />

                    {currentView === "list" && (
                      <Select
                        value={sortBy}
                        onValueChange={(v) =>
                          setSortBy(v as "dueDate" | "priority" | "status" | "name")
                        }
                      >
                        <SelectTrigger className="w-48">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dueDate">Due Date (Soonest)</SelectItem>
                          <SelectItem value="priority">Priority (Highest)</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="name">Task Name (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Button 
                      className="bg-primary" 
                      onClick={openAddTaskModal}
                      disabled={createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Task
                    </Button>

                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isTasksLoading ? (
                  // Loading State
                  <div className="space-y-2">
                    {[1, 2, 3].map((i: number) => (
                      <Card key={i} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Skeleton className="w-5 h-5 mt-1" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : currentView === "list" ? (
                  sortedTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-4">No tasks yet. Create your first task!</p>
                      <Button variant="outline" onClick={openAddTaskModal}>
                        <Plus className="w-4 h-4 mr-2" /> Add First Task
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedTasks.map((task: Task) => (
                        <Card key={task.taskId} className="border hover:border-primary/50">
                          <CardContent className="p-4">

                            <div className="flex items-start space-x-4">
                              
                              <Checkbox
                                checked={task.taskStatus === "Done"}
                                onCheckedChange={(checked) =>
                                  handleTaskStatusChange(task.taskId, checked ? "Done" : "To Do")
                                }
                                className="mt-1"
                                disabled={editTaskMutation.isPending}
                              />

                              <div className="flex-1 min-w-0">

                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className={`font-medium mb-1 ${task.taskStatus === "Done" ? "line-through opacity-60" : ""}`}>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* ⭐ Changed: Simple button that calls onTaskClick */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => onTaskClick?.(task.taskId)}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">

                                  {/* Status */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(task.taskStatus)}`}
                                        disabled={editTaskMutation.isPending}
                                      >
                                        {task.taskStatus}
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      <DropdownMenuItem onClick={() => handleTaskStatusChange(task.taskId, "To Do")}>
                                        To Do
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleTaskStatusChange(task.taskId, "In Progress")}>
                                        In Progress
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleTaskStatusChange(task.taskId, "Done")}>
                                        Done
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>

                                  {/* Priority */}
                                  <Badge className={`${getPriorityColor(task.taskPriority)} border-0`}>
                                    <Flag className="w-3 h-3 mr-1" />
                                    {task.taskPriority}
                                  </Badge>

                                  {/* Due date */}
                                  {task.endAt && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDueDate(task.endAt)}
                                    </div>
                                  )}

                                  {/* Assignees */}
                                  {task.assignees && task.assignees.length > 0 && (
                                    <div className="flex space-x-1">
                                      {task.assignees.slice(0, 3).map((assignee: UserLite, index: number) => (
                                        <Avatar key={index} className="w-6 h-6">
                                          <AvatarFallback>
                                            {getInitials(assignee.username)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {task.assignees.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                          <span className="text-[10px]">+{task.assignees.length - 3}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Subtasks */}
                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <button
                                      onClick={() => toggleTaskExpansion(task.taskId)}
                                      className="flex items-center text-xs text-muted-foreground"
                                    >
                                      {expandedTaskId === task.taskId ? (
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                      )}
                                      {task.subtasks.filter((st: Subtask) => st.subtaskStatus === "Done").length}/{task.subtasks.length} subtasks
                                    </button>
                                  )}

                                </div>

                                {/* Subtasks List */}
                                {expandedTaskId === task.taskId &&
                                  task.subtasks &&
                                  task.subtasks.length > 0 && (
                                    <div className="mt-3 pt-3 border-t space-y-2">
                                      {task.subtasks.map((sub: Subtask) => (
                                        <div key={sub.subtaskId} className="flex items-center space-x-2 pl-4">
                                          {updatingSubtaskId === sub.subtaskId ? (
                                             <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                          ) : (
                                            <Checkbox
                                              checked={sub.subtaskStatus === "Done"}
                                              onCheckedChange={() =>
                                                handleSubtaskStatusChange(task.taskId, sub.subtaskId, sub.subtaskStatus)
                                              }
                                              className="h-4 w-4"
                                              disabled={updatingSubtaskId !== null}
                                            />
                                          )}
                                          <span 
                                            className={`text-sm cursor-pointer select-none ${sub.subtaskStatus === "Done" ? "line-through opacity-60" : ""}`}
                                            onClick={() => !updatingSubtaskId && handleSubtaskStatusChange(task.taskId, sub.subtaskId, sub.subtaskStatus)}
                                          >
                                            {sub.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                              </div>
                            </div>

                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <KanbanBoard
                    eventId={event.eventId}
                    onTaskAction={() => {}}
                  />
                )}
              </CardContent>

            </Card>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUser}
        isPersonal={false}
        eventId={event.eventId}
      />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone and will permanently remove the event and all its associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEventMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}