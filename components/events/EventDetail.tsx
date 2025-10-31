"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui-store";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { SaveTemplateModal } from "@/components/events/SaveTemplateModal";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { KanbanBoard } from "@/components/events/KanbanBoard";
import { Plus, ArrowLeft, MoreVertical, Edit3, Edit, Trash2, Calendar, Users } from "lucide-react";
import { formatEventDateRange } from "@/lib/utils/timeUtils";
import type { Event, Task } from "@/lib/types";

interface EventDetailProps {
  event: Event;
  currentUser: string;
  onBack: () => void;
  onTaskStatusChange: (taskId: string, newStatus: "To Do" | "In Progress" | "Done") => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onTaskAction?: (taskId: string, action: 'edit'|'reassign'|'setDueDate'|'delete') => void;
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
  onSaveTemplate
}: EventDetailProps) {
  const {
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    isSaveTemplateModalOpen,
    closeSaveTemplateModal,
    isDeleteEventDialogOpen,
    closeDeleteEventDialog
  } = useUiStore();

  const [currentView, setCurrentView] = useState<'list'|'board'>('list');
  const [sortBy, setSortBy] = useState<'dueDate'|'priority'|'status'|'name'>('dueDate');
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");

  const handleSaveTemplate = () => {
    if(onSaveTemplate){
      onSaveTemplate(event.id, { name: templateName, description: templateDesc });
      closeSaveTemplateModal();
    }
  };

  const handleCreateTask = (taskData: Omit<Task, "id" | "status" | "createdAt">) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: "To Do",
      createdAt: new Date().toISOString(),
      assignees: taskData.assignees || [], 
    };
    onAddTask(newTask);
    closeAddTaskModal();
  };

  const mappedTasks = event.tasks.map(t => ({
    ...t,
    name: t.title || "Untitled",
    assignees: t.assignees || [], 
    status: ["To Do", "In Progress", "Done"].includes(t.status) ? t.status : "To Do",
    priority: ["Urgent", "High", "Normal", "Low"].includes(t.priority) ? t.priority : "Normal",
    createdAt: t.createdAt || new Date().toISOString()
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
        <div className="space-x-2">
          {onEditEvent && <Button onClick={()=>onEditEvent(event.id)}><Edit className="w-4 h-4 mr-1"/> Edit</Button>}
          <Button onClick={openAddTaskModal}><MoreVertical className="w-4 h-4 mr-1"/> Customize</Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatEventDateRange(
              `${event.date} ${event.time}`,
              event.endDate && event.endTime ? `${event.endDate} ${event.endTime}` : `${event.date} ${event.time}`
            )}
          </p>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button onClick={openAddTaskModal} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2"/> Add Task
        </Button>
      </div>

      <ViewSwitcher currentView={currentView} onViewChange={setCurrentView}/>
      {currentView==='board' ? (
        <KanbanBoard tasks={mappedTasks} onTaskStatusChange={onTaskStatusChange}/>
      ) : (
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {mappedTasks.sort((a,b)=>{
              if(sortBy==='dueDate') {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
              }
              if(sortBy==='priority') return a.priority.localeCompare(b.priority);
              if(sortBy==='status') return a.status.localeCompare(b.status);
              return (a.title||"").localeCompare(b.title||"");
            }).map(task => (
              <Card key={task.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={task.status==='Done'} onCheckedChange={(checked)=>onTaskStatusChange(task.id, checked ? 'Done':'To Do')}/>
                  <span>{task.title}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><MoreVertical className="w-4 h-4"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {onTaskAction && <DropdownMenuItem onClick={()=>onTaskAction(task.id,'edit')}><Edit3 className="w-3 h-3 mr-2"/> Edit</DropdownMenuItem>}
                    {onTaskAction && <DropdownMenuItem onClick={()=>onTaskAction(task.id,'reassign')}><Users className="w-3 h-3 mr-2"/> Reassign</DropdownMenuItem>}
                    {onTaskAction && <DropdownMenuItem onClick={()=>onTaskAction(task.id,'setDueDate')}><Calendar className="w-3 h-3 mr-2"/> Set Due Date</DropdownMenuItem>}
                    {onTaskAction && <DropdownMenuItem onClick={()=>onTaskAction(task.id,'delete')}><Trash2 className="w-3 h-3 mr-2"/> Delete</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        onCreateTask={handleCreateTask}
        eventMembers={[currentUser]}
        currentUser={currentUser}
        isPersonal={true}
      />

      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={closeSaveTemplateModal}
        templateName={templateName}
        templateDesc={templateDesc}
        onNameChange={setTemplateName}
        onDescChange={setTemplateDesc}
        onSave={handleSaveTemplate}
      />

      <AlertDialog open={isDeleteEventDialogOpen} onOpenChange={closeDeleteEventDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=>{ onDeleteEvent?.(event.id); closeDeleteEventDialog(); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
