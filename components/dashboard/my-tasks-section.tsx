"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event, Task } from "@/lib/types";
import { filterTasks, getAllAssignees } from "@/lib/server/supabase/utils";
import { getEffectiveDueDate } from "@/lib/server/supabase/utils";
import { CheckSquare, Plus } from "lucide-react";
import { SearchAndFilter, FilterOptions } from "@/components/search-and-filter";
import { TaskCard } from "@/components/task-card";

interface MyTasksSectionProps {
  events: Event[];
  personalTasks: Task[];
  currentUser: string;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onCreatePersonalTask?: () => void;
}

export function MyTasksSection({
  events,
  personalTasks,
  currentUser,
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllTasks,
  onCreatePersonalTask,
}: MyTasksSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: [] as ("To Do" | "In Progress" | "Done")[],
    priority: [] as ("Urgent" | "High" | "Normal" | "Low")[],
    assignees: [] as string[],
    dateRange: { from: null as Date | null, to: null as Date | null },
    eventTypes: [] as string[],
    showCompleted: true,
    showPersonalTasks: true,
  });
  const [taskSortBy, setTaskSortBy] = useState<"dueDate" | "priority" | "recent">("dueDate");

  const userTasks = useMemo(() => {
    const eventTasks = events.flatMap((event) =>
      event.tasks
        .filter((task) => task.assignees && task.assignees.includes(currentUser))
        .map((task) => ({ ...task, eventTitle: event.title }))
    );
    const personalUserTasks = personalTasks
      .filter((task) => task.assignees && task.assignees.includes(currentUser))
      .map((task) => ({ ...task, eventTitle: undefined }));
    return [...eventTasks, ...personalUserTasks];
  }, [events, personalTasks, currentUser]);

  const availableAssignees = useMemo(() => {
    return getAllAssignees(userTasks, events);
  }, [userTasks, events]);

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(userTasks, searchTerm, filters);
    return [...filtered].sort((a, b) => {
      if (taskSortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (taskSortBy === "priority") {
        const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      } else {
        return b.id.localeCompare(a.id);
      }
    });
  }, [userTasks, searchTerm, filters, taskSortBy]);



  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Tasks</h2>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
            <span>{userTasks.length} total</span>
            <span>•</span>
            <span>{userTasks.filter((task) => task.status === "Done").length} completed</span>
            <span>•</span>
            <span className="text-warning">
              {userTasks.filter((task) => {
                const effectiveDueDate = getEffectiveDueDate(task);
                if (!effectiveDueDate) return false;
                const dueDate = new Date(effectiveDueDate);
                const today = new Date();
                dueDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return dueDate < today && task.status !== "Done";
              }).length}{" "}
              overdue
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" onClick={onCreatePersonalTask} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Personal Task
          </Button>
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableAssignees={availableAssignees}
        showTaskFilters={true}
        placeholder="Search your tasks..."
        currentUser={currentUser}
        sortBy={taskSortBy}
        onSortChange={setTaskSortBy}
        showSort={true}
      />

      {filteredAndSortedTasks.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                (filters.priority && filters.priority.length > 0) ||
                (filters.assignees && filters.assignees.length > 0) ||
                filters.dateRange?.from
                  ? "Try adjusting your filters to see more tasks."
                  : "Event tasks and personal tasks will appear here"}
              </p>
              <div className="flex items-center justify-center gap-2">
                {(searchTerm ||
                  (filters.status && filters.status.length > 0) ||
                  (filters.priority && filters.priority.length > 0) ||
                  (filters.assignees && filters.assignees.length > 0) ||
                  filters.dateRange?.from) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({
                        status: [],
                        priority: [],
                        assignees: [],
                        dateRange: { from: null, to: null },
                        eventTypes: [],
                        showCompleted: true,
                        showPersonalTasks: true,
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button size="sm" onClick={onCreatePersonalTask} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Personal Task
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div>
                {filteredAndSortedTasks.slice(0, 8).map((task, index) => (
                <div key={task.id}>
                  <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  onSubTaskToggle={onSubTaskToggle}
                  />
                  {index < filteredAndSortedTasks.slice(0, 8).length - 1 && (
                  <div className="border-b border-border my-2" />
                  )}
                </div>
                ))}

              {filteredAndSortedTasks.length > 8 && (
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full text-primary"
                    onClick={() => onNavigateToAllTasks?.("my")}
                  >
                    View {filteredAndSortedTasks.length - 8} more tasks
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
