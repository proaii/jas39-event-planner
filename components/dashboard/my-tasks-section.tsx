'use client';

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event, Task } from "@/lib/types";
import { filterTasks, getAllAssignees } from "@/lib/server/supabase/utils";
import { getEffectiveDueDate } from "@/lib/server/supabase/utils";
import { CheckSquare, Plus } from "lucide-react";
import { SearchAndFilter, FilterOptions } from "@/components/search-and-filter";
import { TaskCard } from "@/components/task-card";
import { useFetchEvents } from "@/stores/useEventStore";
import { useFetchAllTasks } from "@/lib/client/features/tasks/hooks";
import { useFetchCurrentUser } from "@/lib/client/features/users/hooks"; 

interface MyTasksSectionProps {
  onStatusChange?: (taskId: string, newStatus: Task["taskStatus"]) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onNavigateToAllTasks?: (filterContext?: "my" | "all") => void;
  onCreatePersonalTask: () => void;
}

type Dateish = { startDate?: string; endDate?: string; dueDate?: string };
function effectiveDueDateOf(t: Task): string | undefined {
  const dateish: Dateish = {
    startDate: t.startAt ?? undefined,
    endDate: t.endAt ?? undefined,
    dueDate: t.endAt ?? undefined,
  };
  return getEffectiveDueDate(dateish) ?? undefined;
}

interface PaginatedPage {
  items?: Task[] | Event[];
}

interface PaginatedData {
  pages?: PaginatedPage[];
}

export function MyTasksSection({
  onStatusChange,
  onSubTaskToggle,
  onNavigateToAllTasks,
  onCreatePersonalTask,
}: MyTasksSectionProps) {
  // Fetch current user
  const { data: currentUser, isLoading: loadingUser } = useFetchCurrentUser();
  
  const { data: eventsData, isLoading: loadingEvents, error: errorEvents } = useFetchEvents();
  const { data: tasksData, isLoading: loadingTasks, error: errorTasks } = useFetchAllTasks({ pageSize: 200 });

  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    priority: [],
    assignees: [],
    dateRange: { from: null, to: null },
    eventTypes: [],
    showCompleted: true,
    showPersonalTasks: true,
  });
  const [taskSortBy, setTaskSortBy] = useState<"dueDate" | "priority" | "recent">("dueDate");

  const isLoading = loadingUser || loadingEvents || loadingTasks;
  const error = errorEvents?.message || errorTasks?.message || null;

  // Flatten paginated data safely
  useEffect(() => {
    const flatEvents: Event[] = eventsData
      ? "pages" in eventsData && Array.isArray((eventsData as PaginatedData).pages)
        ? (eventsData as PaginatedData).pages!.flatMap((p: PaginatedPage) => Array.isArray(p?.items) ? p.items as Event[] : [])
        : Array.isArray((eventsData as { items?: Event[] }).items)
          ? (eventsData as { items: Event[] }).items
          : []
      : [];

    const flatTasks: Task[] = tasksData
      ? "pages" in tasksData && Array.isArray((tasksData as PaginatedData).pages)
        ? (tasksData as PaginatedData).pages!.flatMap((p: PaginatedPage) => Array.isArray(p?.items) ? p.items as Task[] : [])
        : Array.isArray((tasksData as { items?: Task[] }).items)
          ? (tasksData as { items: Task[] }).items
          : []
      : [];

    setEvents(flatEvents);
    setTasks(flatTasks);
  }, [eventsData, tasksData]);

  const userTasks = useMemo(() => {
    if (!currentUser) return [];
    
    const isAssignedToCurrentUser = (t: Task) =>
      t.assignees?.some(
        (a) =>
          a?.username === currentUser.username ||
          a?.userId === currentUser.userId ||
          a?.email === currentUser.email
      ) ?? false;

    const eventMap = new Map(events.map((e) => [e.eventId, e.title]));
    return tasks.filter(isAssignedToCurrentUser).map((t) => ({
      ...t,
      eventTitle: t.eventId ? eventMap.get(t.eventId) : undefined,
    }));
  }, [tasks, events, currentUser]);

  const availableAssignees = useMemo(() => getAllAssignees(userTasks, events), [userTasks, events]);

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(userTasks, searchTerm, filters);
    return [...filtered].sort((a, b) => {
      if (taskSortBy === "dueDate") {
        const aDue = effectiveDueDateOf(a);
        const bDue = effectiveDueDateOf(b);
        if (!aDue && !bDue) return 0;
        if (!aDue) return 1;
        if (!bDue) return -1;
        return new Date(aDue).getTime() - new Date(bDue).getTime();
      } else if (taskSortBy === "priority") {
        const order = { Urgent: 0, High: 1, Normal: 2, Low: 3 } as const;
        const ap = (a.taskPriority && order[a.taskPriority as keyof typeof order]) ?? 2;
        const bp = (b.taskPriority && order[b.taskPriority as keyof typeof order]) ?? 2;
        return ap - bp;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [userTasks, searchTerm, filters, taskSortBy]);

  const handleFiltersChange = (newFilters: FilterOptions) => setFilters(newFilters);

  const totalCompleted = userTasks.filter((t) => t.taskStatus === "Done").length;
  const totalOverdue = userTasks.filter((t) => {
    const effectiveDueDate = effectiveDueDateOf(t);
    if (!effectiveDueDate) return false;
    const dueDate = new Date(effectiveDueDate);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today && t.taskStatus !== "Done";
  }).length;

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <CardContent>Loading tasks...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="p-8 text-center">
        <CardContent>Please log in to view your tasks</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Tasks</h2>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
            <span>{userTasks.length} total</span>
            <span>•</span>
            <span>{totalCompleted} completed</span>
            <span>•</span>
            <span className="text-warning">{totalOverdue} overdue</span>
          </div>
        </div>
        <Button size="sm" onClick={onCreatePersonalTask} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Personal Task
        </Button>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableAssignees={availableAssignees}
        showTaskFilters
        placeholder="Search your tasks..."
        currentUser={currentUser.username}
        sortBy={taskSortBy}
        onSortChange={setTaskSortBy}
        showSort
      />

      {filteredAndSortedTasks.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {(searchTerm || (filters.priority?.length ?? 0) > 0 || (filters.assignees?.length ?? 0) > 0 || filters.dateRange?.from)
                  ? "Try adjusting your filters to see more tasks."
                  : "Event tasks and personal tasks will appear here"}
              </p>
              <div className="flex items-center justify-center gap-2">
                {(searchTerm || (filters.status?.length ?? 0) > 0 || (filters.priority?.length ?? 0) > 0 || (filters.assignees?.length ?? 0) > 0 || filters.dateRange?.from) && (
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
                <div key={task.taskId}>
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
                <Button variant="ghost" className="w-full text-primary" onClick={() => onNavigateToAllTasks?.("my")}>
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