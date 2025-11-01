"use client";

import React, { useState } from "react";
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
  DropdownMenuSeparator,
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
  Save,
  Share,
  Trash2,
  Plus,
  TrendingUp,
  CheckSquare,
  MoreVertical,
  Edit3,
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
} from "lucide-react";

import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { SaveTemplateModal } from "@/components/events/SaveTemplateModal";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { KanbanBoard } from "@/components/events/KanbanBoard";
import type { TemplateData } from "@/components/events/SaveTemplateModal";
import type { Event, Task } from "@/lib/types";
import { useUiStore } from "@/stores/ui-store";

interface EventDetailProps {
  event: Event;
  currentUser: string;
  onBack: () => void;
  onTaskStatusChange: (taskId: string, newStatus: "To Do" | "In Progress" | "Done") => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  onTaskAction?: (taskId: string, action: "edit" | "reassign" | "setDueDate" | "delete") => void;
  onDeleteEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onSaveTemplate?: (eventId: string, templateData: TemplateData) => void;
}

export function EventDetail({
  event,
  currentUser,
  onBack,
  onTaskStatusChange,
  onAddTask,
  onTaskAction,
  onDeleteEvent,
  onEditEvent,
  onSaveTemplate,
}: EventDetailProps) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status" | "name">("dueDate");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showCoverImage, setShowCoverImage] = useState(true);
  const [currentView, setCurrentView] = useState<"list" | "board">("list");

  const { openEditEventModal } = useUiStore();

  const tasks = event.tasks || [];
  const members = event.members || [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const todoTasks = tasks.filter(t => t.status === "To Do").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getInitials = (name: string) =>
    name?.split(" ").map(p => p[0]).join("").toUpperCase() || "";

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Urgent": return "bg-destructive text-destructive-foreground";
      case "High": return "bg-warning text-warning-foreground";
      case "Normal": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Done": return "bg-secondary/20 text-secondary hover:bg-secondary/30";
      case "In Progress": return "bg-warning/20 text-warning hover:bg-warning/30";
      default: return "bg-muted text-muted-foreground hover:bg-muted/70";
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        const order = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
        return order[a.priority] - order[b.priority];
      case "status":
        const statusOrder = { "To Do": 0, "In Progress": 1, Done: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return a.title?.localeCompare(b.title) || 0;
    }
  });

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

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
              <Button variant="outline" size="sm" onClick={() => openEditEventModal(event.id)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Event
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveTemplateModal(true)}>
                <Save className="w-4 h-4 mr-2" /> Save as Template
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" /> Share
              </Button>
              {onDeleteEvent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Event Picture */}
            {showCoverImage && event.coverImage && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="relative">
                  <div className="aspect-video">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setShowCoverImage(false);
                      }}
                    />
                  </div>
                  
                  {/* Image Controls */}
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
            
            {/* Show Photo Button when hidden */}
            {!showCoverImage && event.coverImage && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="py-4">
                    <Image className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
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

            {/* Event Details Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">
                    {event.time && formatTime(event.time)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{event.location}</span>
                </div>
                
                {event.description && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Widgets - 3 Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Progress Widget */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Progress
                  </div>
                </CardContent>
              </Card>

              {/* Members Widget */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {members.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Members
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Widget */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <ListTodo className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {todoTasks + inProgressTasks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pending
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Members Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.map(member => (
                  <div key={member} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground flex-1">{member}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Tasks</CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* View Switcher */}
                    <ViewSwitcher 
                      currentView={currentView} 
                      onViewChange={setCurrentView}
                    />
                    
                    {/* Sort By Dropdown */}
                    {currentView === "list" && (
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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
                    
                    {/* Add Task Button */}
                    <Button 
                      onClick={() => setShowAddTaskModal(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentView === "list" ? (
                  // List View
                  sortedTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-4">No tasks yet. Create your first task to get started!</p>
                      <Button 
                        onClick={() => setShowAddTaskModal(true)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Task
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedTasks.map(task => (
                        <Card key={task.id} className="border border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                checked={task.status === "Done"}
                                onCheckedChange={(checked) => {
                                  onTaskStatusChange(task.id, checked ? "Done" : "To Do");
                                }}
                                className="mt-1"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className={`font-medium text-foreground mb-1 ${task.status === "Done" ? "line-through opacity-60" : ""}`}>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem 
                                        onClick={() => onTaskAction?.(task.id, "edit")}
                                        className="cursor-pointer"
                                      >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit Task
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => onTaskAction?.(task.id, "delete")}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Task
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${getStatusColor(task.status)}`}>
                                        {task.status}
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      <DropdownMenuItem 
                                        onClick={() => onTaskStatusChange(task.id, "To Do")}
                                        className="cursor-pointer"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-muted mr-2" />
                                        To Do
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => onTaskStatusChange(task.id, "In Progress")}
                                        className="cursor-pointer"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-warning mr-2" />
                                        In Progress
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => onTaskStatusChange(task.id, "Done")}
                                        className="cursor-pointer"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-secondary mr-2" />
                                        Done
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>

                                  <Badge variant="secondary" className={`${getPriorityColor(task.priority)} border-0`}>
                                    <Flag className="w-3 h-3 mr-1" />
                                    {task.priority}
                                  </Badge>

                                  {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDueDate(task.dueDate)}
                                    </div>
                                  )}

                                  {task.assignees && task.assignees.length > 0 && (
                                    <div className="flex space-x-1">
                                      {task.assignees.slice(0, 3).map((assignee, index) => (
                                        <Avatar key={index} className="w-6 h-6">
                                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                            {getInitials(assignee)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {task.assignees.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                          <span className="text-[10px] text-muted-foreground">
                                            +{task.assignees.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {task.subTasks && task.subTasks.length > 0 && (
                                    <button
                                      onClick={() => toggleTaskExpansion(task.id)}
                                      className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {expandedTaskId === task.id ? (
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                      )}
                                      {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} subtasks
                                    </button>
                                  )}
                                </div>

                                {expandedTaskId === task.id && task.subTasks && task.subTasks.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                                    {task.subTasks.map((subTask) => (
                                      <div key={subTask.id} className="flex items-center space-x-2 pl-4">
                                        <Checkbox
                                          checked={subTask.completed}
                                          className="h-4 w-4"
                                        />
                                        <span className={`text-sm ${subTask.completed ? "line-through opacity-60" : ""}`}>
                                          {subTask.name}
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
                    tasks={event.tasks.map(task => ({
                      ...task,
                      assignees: task.assignees || []
                    }))}
                    onTaskStatusChange={onTaskStatusChange}
                    onTaskAction={onTaskAction}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onCreateTask={t => {
          onAddTask({ ...t, status: "To Do", createdAt: new Date().toISOString() });
          setShowAddTaskModal(false);
        }}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal
      />

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        templateData={event}
        onSave={templateData => {
          onSaveTemplate?.(event.id, templateData);
          setShowSaveTemplateModal(false);
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone and will permanently remove the event and all its associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteEvent?.(event.id);
                setShowDeleteDialog(false);
                onBack();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}