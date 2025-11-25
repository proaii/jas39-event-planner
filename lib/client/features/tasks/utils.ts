// lib/client/features/tasks/utils.ts
import { Task, TaskStatus, Event, FilterOptions } from '@/lib/types';

export const filterTasks = (tasks: Task[], searchTerm: string, filters: FilterOptions): Task[] => {
  return tasks.filter((task) => {
    /* ----- Text Search ----- */
    if (searchTerm) {
      const q = searchTerm.toLowerCase();

      const titleHit = task.title.toLowerCase().includes(q);
      const descHit = task.description?.toLowerCase().includes(q) ?? false;

      if (!(titleHit || descHit)) return false;
    }

    /* ----- Status Filter ----- */
    if (filters.status?.length) {
      if (!filters.status.includes(task.taskStatus)) return false;
    }

    /* ----- Priority Filter ----- */
    if (filters.priority?.length) {
      if (!filters.priority.includes(task.taskPriority)) return false;
    }

    /* ----- Completed Toggle ----- */
    if (filters.showCompleted === false && task.taskStatus === "Done") {
      return false;
    }

    /* ----- Personal Task Toggle (eventId === null) ----- */
    if (filters.showPersonalTasks === false && task.eventId === null) {
      return false;
    }

    return true;
  });
};

export const sortTasks = (tasks: Task[], sortBy: "date" | "name" | "progress"): Task[] => {
  const sorted = [...tasks]; // Create a shallow copy to avoid mutating the original array

  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "date") {
    sorted.sort((a, b) => {
      const dateA = a.endAt ? new Date(a.endAt).getTime() : Infinity;
      const dateB = b.endAt ? new Date(b.endAt).getTime() : Infinity;
      return dateA - dateB;
    });
  } else if (sortBy === "progress") {
    const statusOrder: Record<TaskStatus, number> = { "To Do": 0, "In Progress": 1, "Done": 2 };
    sorted.sort((a, b) => statusOrder[a.taskStatus] - statusOrder[b.taskStatus]);
  }

  return sorted;
};

/* ===================== Assignee Collection ===================== */

export const getAllAssignees = (tasks: Task[], events: Event[]): string[] => {
  const acc = new Set<string>();

  // From task.assignees (UserLite[])
  tasks.forEach((t) => {
    t.assignees?.forEach((a) => {
      // Prefer username > email > userId
      if (a.username) acc.add(a.username);
      else if (a.email) acc.add(a.email);
      else if (a.userId) acc.add(a.userId);
    });
  });

  // From event.members (array of userId)
  events.forEach((e) => {
    e.members.forEach((uid) => acc.add(uid));
  });

  return Array.from(acc).sort((a, b) => a.localeCompare(b));
};