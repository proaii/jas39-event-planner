"use client";

import React, { useState } from "react";
import {
  Button
} from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  Users,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  ListTodo,
  CheckSquare,
  MoreVertical,
  Edit3,
  Flag,
  MessageCircle,
} from "lucide-react";

import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { SaveTemplateModal } from "@/components/events/SaveTemplateModal";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { KanbanBoard } from "@/components/events/KanbanBoard";
import {
  formatEventDateRange,
  isCurrentlyActive,
} from "@/lib/utils/timeUtils";
import type { Event, Task } from "@/lib/types";

interface EventDetailProps {
  event: Event;
  currentUser: string;
  onBack: () => void;
  onTaskStatusChange: (taskId: string, newStatus: "To Do" | "In Progress" | "Done") => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  onTaskAction?: (taskId: string, action: "edit" | "reassign" | "setDueDate" | "delete") => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onSaveTemplate?: (eventId: string, templateData: { name: string; description: string }) => void;
}

export function EventDetail({
  event,
  currentUser,
  onBack,
  onTaskStatusChange,
  onAddTask,
  onTaskAction,
  onEditEvent,
  onDeleteEvent,
  onSaveTemplate,
}: EventDetailProps) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "board">("list");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status" | "name">("dueDate");

  const totalTasks = event.tasks.length;
  const completedTasks = event.tasks.filter(t => t.status === "Done").length;
  const todoTasks = event.tasks.filter(t => t.status === "To Do").length;
  const inProgressTasks = event.tasks.filter(t => t.status === "In Progress").length;

  const getInitials = (name: string) =>
    name.split(" ").map(p => p[0]).join("").toUpperCase();

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
      case "Done": return "bg-secondary/20 text-secondary";
      case "In Progress": return "bg-warning/20 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const sortedTasks = [...event.tasks].sort((a, b) => {
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
        return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
        <div className="bg-muted/20 border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>
            <h1 className="text-xl font-semibold text-foreground">{event.title}</h1>
            </div>

            <div className="flex items-center space-x-2">
            {onEditEvent && (
                <Button variant="outline" onClick={() => onEditEvent(event.id)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
            )}
            <Button variant="outline" onClick={() => setShowSaveTemplateModal(true)}>
                <Save className="w-4 h-4 mr-2" /> Save Template
            </Button>
            <Button variant="outline">
                <Share className="w-4 h-4 mr-2" /> Share
            </Button>
            {onDeleteEvent && (
                <Button
                variant="outline"
                className="border-destructive text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
            )}
            </div>
        </div>
        </div>


      {/* Main Content */}
      <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              <div className="bg-muted flex items-center justify-center">
                <Calendar className="w-16 h-16 text-muted-foreground" />
              </div>
            </AspectRatio>
          </Card>

          {/* Event Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div
                className={`flex items-center ${
                  isCurrentlyActive(`${event.date} ${event.time}`)
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                {formatEventDateRange(
                  `${event.date} ${event.time}`,
                  event.endDate ? `${event.endDate} ${event.endTime}` : `${event.date} ${event.time}`
                )}
              </div>

              {event.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
              )}

              {event.description && (
                <p className="text-sm text-foreground leading-relaxed">
                  {event.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Widgets */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<TrendingUp className="w-6 h-6 text-primary" />} label="Progress" value={`${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%`} />
            <StatCard icon={<Users className="w-6 h-6 text-secondary" />} label="Members" value={event.members?.length ?? 1} />
            <StatCard icon={<ListTodo className="w-6 h-6 text-warning" />} label="Pending" value={todoTasks + inProgressTasks} />
          </div>

          {/* Members */}
            <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-base m-0">Team Members</CardTitle>
                <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                >
                <UserPlus className="w-4 h-4 mr-1" /> Invite
                </Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {(event.members || [currentUser]).map((m) => (
                <div
                    key={m}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                >
                    <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(m)}
                    </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{m}</span>
                </div>
                ))}
            </CardContent>
            </Card>


          {/* Discussion Placeholder */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <MessageCircle className="w-4 h-4 mr-2" /> Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground text-center">
              Team chat coming soon
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tasks */}
        <div className="lg:col-span-8">
        <Card className="border-0 shadow-sm">
            <CardHeader className="flex items-center justify-between">
            {/* Left side: Title */}
            <CardTitle className="text-base m-0">Tasks</CardTitle>

            {/* Right side: Controls */}
            <div className="flex items-center space-x-2">
                {/* List/Board view switcher */}
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

                {/* Sort dropdown (แสดงเฉพาะ list view) */}
                {currentView === "list" && (
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-40">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                </Select>
                )}

                {/* Add Task button */}
                <Button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-primary hover:bg-primary/90 flex items-center"
                >
                <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
            </div>
            </CardHeader>

            <CardContent>
            {currentView === "board" ? (
                <KanbanBoard
                tasks={event.tasks.map((task) => ({
                    id: task.id,
                    name: task.title,
                    assignees: [currentUser],
                    status: task.status,
                    priority: task.priority,
                    description: task.description,
                    dueDate: task.dueDate,
                    isPersonal: true,
                }))}
                onTaskStatusChange={onTaskStatusChange}
                />
            ) : (
                <ScrollArea className="h-[550px]">
                {sortedTasks.length === 0 ? (
                    <EmptyTaskPlaceholder />
                ) : (
                    <TaskList
                    tasks={sortedTasks}
                    onTaskAction={onTaskAction}
                    onTaskStatusChange={onTaskStatusChange}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    />
                )}
                </ScrollArea>
            )}
            </CardContent>
        </Card>
        </div>

      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onCreateTask={(t) => {
        onAddTask({
            ...t,
            status: "To Do",
            createdAt: new Date().toISOString(), 
        });
        setShowAddTaskModal(false);
        }}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal
      />

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        templateName=""
        templateDesc=""
        onNameChange={() => {}}
        onDescChange={() => {}}
        onSave={(data) => {
          onSaveTemplate?.(event.id, data);
          setShowSaveTemplateModal(false);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteEvent?.(event.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------
 * Subcomponents for readability
 * ------------------------------ */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="mb-1">{icon}</div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function EmptyTaskPlaceholder() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No tasks yet. Add your first task!</p>
    </div>
  );
}

function TaskList({
  tasks,
  onTaskAction,
  onTaskStatusChange,
  getStatusColor,
  getPriorityColor,
}: {
  tasks: Task[];
  onTaskAction?: EventDetailProps["onTaskAction"];
  onTaskStatusChange: EventDetailProps["onTaskStatusChange"];
  getStatusColor: (s: Task["status"]) => string;
  getPriorityColor: (p: Task["priority"]) => string;
}) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="border hover:border-primary/40">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.status === "Done"}
                onCheckedChange={(c) => onTaskStatusChange(task.id, c ? "Done" : "To Do")}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4
                    className={`font-medium ${
                      task.status === "Done" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskAction?.(task.id, "edit")}>
                        <Edit3 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onTaskAction?.(task.id, "delete")}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    <Flag className="w-3 h-3 mr-1" /> {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
