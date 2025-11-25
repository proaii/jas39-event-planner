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
import { Search, Filter, Plus, ArrowUpDown, AlertCircle } from "lucide-react";
import { Task } from "@/lib/types";

import { useUiStore } from "@/stores/ui-store";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { TaskCard } from "@/components/task-card";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { useFetchUsers, useFetchUser } from "@/lib/client/features/users/hooks";
import { useUser } from "@/lib/client/features/auth/hooks";
import { useQuery } from "@tanstack/react-query";
import { filterTasks, sortTasks } from "@/lib/utils";
import { TasksGridSkeleton } from "@/components/tasks/TasksGridSkeleton";

// ------------------- API Helpers -------------------
async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

// ------------------- Main Component -------------------
export default function AllTasksPage() {

  const {
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    isEditTaskModalOpen,
    selectedTaskIdForEdit,
    openEditTaskModal,
    closeEditTaskModal,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    progressFilters,
    setProgressFilters,
  } = useUiStore();

  const [tempProgressFilters, setTempProgressFilters] = useState(progressFilters);

  useEffect(() => {
    if (isFilterOpen) setTempProgressFilters(progressFilters);
  }, [isFilterOpen, progressFilters]);

  // ------------------- USERS -------------------
  const [userSearchQuery] = useState("");
  const { data: authUser } = useUser();
  const { data: currentUser } = useFetchUser(authUser?.id ?? "");
  const { data: allUsers = [], isLoading: usersLoading } = useFetchUsers({
    q: userSearchQuery,
    enabled: true,
  });

  // ------------------- TASKS -------------------
  const { data: allTasks = [], isLoading: tasksLoading, isError: tasksError } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // ------------------- HANDLERS -------------------
  const handleTaskClick = (taskId: string) => openEditTaskModal(taskId);

  const applyTempFilters = () => {
    setProgressFilters(tempProgressFilters);
    setIsFilterOpen(false);
  };

  const clearTempFilters = () =>
    setTempProgressFilters({ notStarted: true, inProgress: true, completed: true });

  // ------------------- FILTER & SORT -------------------
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(allTasks, searchQuery, progressFilters);
    return sortTasks(filtered, sortBy);
  }, [allTasks, searchQuery, progressFilters, sortBy]);

  // ------------------- RENDER -------------------
  if (tasksLoading || usersLoading) return <TasksGridSkeleton />;
  if (tasksError) return (
    <Card className="p-12 text-center border-destructive">
      <div className="space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
        <h3 className="font-semibold text-destructive mb-2">Failed to load tasks</h3>
        <p className="text-muted-foreground mb-4">
          An error occurred while fetching your tasks. Please try again later.
        </p>
      </div>
    </Card>
  );

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

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        eventMembers={allUsers}
        currentUser={currentUser}
        isPersonal={true}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={closeEditTaskModal}
        availableAssignees={allUsers}
        taskId={selectedTaskIdForEdit}
      />
    </main>
  );
}