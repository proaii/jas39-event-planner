"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Plus, ArrowUpDown } from "lucide-react";
import { Task, TaskStatus, UserLite } from "@/lib/types";

import { useUiStore } from "@/stores/ui-store";
import { useTaskStore } from "@/stores/task-store"; 
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { TaskCard } from "@/components/task-card";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { useFetchUsers } from "@/lib/client/features/users/hooks";

export default function AllTasksPage() {
  // ------------------- UI STORE -------------------
  const {
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    progressFilters,
    setProgressFilters,
    dateFilters,
    setDateFilters,
  } = useUiStore();

  const [tempProgressFilters, setTempProgressFilters] = useState(progressFilters);
  const [tempDateFilters, setTempDateFilters] = useState(dateFilters);

  useEffect(() => {
    if (isFilterOpen) {
      setTempProgressFilters(progressFilters);
      setTempDateFilters(dateFilters);
    }
  }, [isFilterOpen, progressFilters, dateFilters]);

  // ------------------- USERS -------------------
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const { data: allUsers = [], isLoading: isUsersLoading } = useFetchUsers({
    q: userSearchQuery,
    enabled: true,
  });

  // Select current user as first user for now (or integrate with auth)
  const currentUser: UserLite | null = allUsers[0] ?? null;

  // ------------------- TASKS STORE -------------------
  const { tasks: allTasks } = useTaskStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (taskId: string) => {
    const task = allTasks.find((t) => t.taskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  // ------------------- HANDLERS -------------------
  // const handleCreateTask = (taskData: Omit<Task, "taskId" | "createdAt">) => {
  //   const newTask: Task = {
  //     taskId: `task-${Date.now()}`,
  //     createdAt: new Date().toISOString(),
  //     ...taskData,
  //     taskStatus: "To Do",
  //     taskPriority: "Normal",
  //   };
  //   addTask(newTask); 
  //   closeAddTaskModal();
  //   toast.success(`Task "${taskData.title}" created successfully!`);
  // };

  // const handleUpdateTask = (taskId: string, updatedData: OnUpdateTaskPayload) => {
  //   updateTask(taskId, updatedData); 
  //   setIsEditModalOpen(false);
  //   setSelectedTask(null);
  //   toast.success(`Task "${updatedData.title}" updated successfully!`);
  // };

  const applyTempFilters = () => {
    setProgressFilters(tempProgressFilters);
    setDateFilters(tempDateFilters);
    setIsFilterOpen(false);
  };

  const clearTempFilters = () => {
    setTempProgressFilters({ notStarted: true, inProgress: true, completed: true });
    setTempDateFilters({ past: true, thisWeek: true, thisMonth: true, upcoming: true });
  };

  // ------------------- FILTER & SORT -------------------
  const filteredAndSortedTasks = useMemo(() => {
    let filtered: Task[] = allTasks;

    // --- Search ---
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task: Task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // --- Status Filter ---
    if (!progressFilters.notStarted) filtered = filtered.filter((t) => t.taskStatus !== "To Do");
    if (!progressFilters.inProgress) filtered = filtered.filter((t) => t.taskStatus !== "In Progress");
    if (!progressFilters.completed) filtered = filtered.filter((t) => t.taskStatus !== "Done");

    // --- Sorting ---
    if (sortBy === "name") filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "date") {
      filtered.sort((a, b) => {
        const dateA = a.endAt ? new Date(a.endAt).getTime() : Infinity;
        const dateB = b.endAt ? new Date(b.endAt).getTime() : Infinity;
        return dateA - dateB;
      });
    } else if (sortBy === "progress") {
      const statusOrder: Record<TaskStatus, number> = { "To Do": 0, "In Progress": 1, "Done": 2 };
      filtered.sort((a, b) => statusOrder[a.taskStatus] - statusOrder[b.taskStatus]);
    }

    return filtered;
  }, [allTasks, searchQuery, progressFilters, sortBy]);

  // ------------------- RENDER -------------------
  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">All Tasks</h1>
          <p className="text-muted-foreground">View and manage all your tasks</p>
        </div>

        <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
          <Button
            onClick={openAddTaskModal}
            className="bg-primary hover:bg-primary/90 rounded-r-none border-r border-primary-foreground/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Search / Filter / Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-initial">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-6">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground">Filter Tasks</h3>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Filter by Status</label>
                  <div className="space-y-2">
                    {(['To Do', 'In Progress', 'Done'] as const).map((key) => {
                      const filterKey = {
                        'To Do': 'notStarted',
                        'In Progress': 'inProgress',
                        'Done': 'completed',
                      }[key] as keyof typeof tempProgressFilters;
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`progress-${key}`}
                            checked={tempProgressFilters[filterKey]}
                            onCheckedChange={(checked) =>
                              setTempProgressFilters((prev) => ({
                                ...prev,
                                [filterKey]: checked as boolean,
                              }))
                            }
                          />
                          <label htmlFor={`progress-${key}`} className="text-sm text-foreground">
                            {key}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTempFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                  <Button size="sm" onClick={applyTempFilters} className="bg-primary hover:bg-primary/90">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "name" | "progress")}>
            <SelectTrigger className="w-full sm:w-52 flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Due Date (Soonest)</SelectItem>
              <SelectItem value="name">Task Name (A-Z)</SelectItem>
              <SelectItem value="progress">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredAndSortedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Search className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {allTasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {allTasks.length === 0
                  ? "Get started by creating your first task"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {allTasks.length === 0 && (
                <Button onClick={openAddTaskModal} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
          {filteredAndSortedTasks.map((task: Task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onClick={handleTaskClick}
            />
          ))}
        </div>
      )}

      {/* Results Counter */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="text-center text-muted-foreground text-sm pt-4">
          Showing {filteredAndSortedTasks.length} of {allTasks.length} task
          {allTasks.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUser}
        isPersonal={true}
      />


      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        availableAssignees={allUsers}
      />
    </main>
  );
}