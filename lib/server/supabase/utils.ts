import { Task, Event } from "@/lib/types";

export const getEffectiveDueDate = (task: {
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}): string | null => {
  // If task has a time period (start and end dates), the due date is the end date
  if (task.startDate && task.endDate) {
    return task.endDate;
  }

  // Otherwise, use the regular due date
  return task.dueDate || null;
};

interface FilterOptions {
  status?: ("To Do" | "In Progress" | "Done")[];
  priority?: ("Urgent" | "High" | "Normal" | "Low")[];
  assignees?: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  eventTypes?: string[];
  showCompleted?: boolean;
  showPersonalTasks?: boolean;
}

export const filterTasks = (
  tasks: Task[],
  searchTerm: string,
  filters: FilterOptions
): Task[] => {
  return tasks.filter((task) => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower)) ||
        (task.assignees &&
          task.assignees.some((assignee) =>
            assignee.toLowerCase().includes(searchLower)
          ));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }

    // Assignee filter
    if (filters.assignees && filters.assignees.length > 0) {
      const hasMatchingAssignee = task.assignees && task.assignees.some((assignee) =>
        filters.assignees!.includes(assignee)
      );
      if (!hasMatchingAssignee) return false;
    }

    // Enhanced date range filter for time periods
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate =
        filters.dateRange.to ? new Date(filters.dateRange.to) : new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);

      let taskOverlapsRange = false;

      // Check if task has time period (startDate/endDate)
      if (task.startDate) {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = task.endDate ? new Date(task.endDate) : taskStartDate;

        // Task overlaps if: task starts before range ends AND task ends after range starts
        taskOverlapsRange = taskStartDate <= toDate && taskEndDate >= fromDate;
      } else {
        // Check effective due date (endDate for time periods, or dueDate for traditional tasks)
        const effectiveDueDate = getEffectiveDueDate(task);
        if (effectiveDueDate) {
          const taskDate = new Date(effectiveDueDate);
          taskOverlapsRange = taskDate >= fromDate && taskDate <= toDate;
        }
      }

      if (!taskOverlapsRange) return false;
    }

    // Show completed filter
    if (filters.showCompleted === false && task.status === "Done") {
      return false;
    }

    // Show personal tasks filter
    if (filters.showPersonalTasks === false && task.isPersonal) {
      return false;
    }

    return true;
  });
};

export const getAllAssignees = (tasks: Task[], events: Event[]): string[] => {
  const assigneesSet = new Set<string>();

  // Add task assignees
  tasks.forEach((task) => {
    if (task.assignees) {
      task.assignees.forEach((assignee) => assigneesSet.add(assignee));
    }
  });

  // Add event members
  events.forEach((event) => {
    event.members.forEach((member) => assigneesSet.add(member));
  });

  return Array.from(assigneesSet).sort();
};
