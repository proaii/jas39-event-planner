import type { Task, Event, UserLite } from "@/lib/types";

/* ===================== Effective Due Date ===================== */

/** A generic date-like shape */
type Dateish = { startDate?: string; endDate?: string; dueDate?: string };

/** Base logic: compute due date from a Dateish object */
function getEffectiveDueDateFromDateish(d: Dateish): string | null {
  if (d.startDate && d.endDate) return d.endDate;
  return d.dueDate ?? null;
}

/** Overloads: accepts either a Task or Dateish */
export function getEffectiveDueDate(task: Task): string | null;
export function getEffectiveDueDate(dateish: Dateish): string | null;
export function getEffectiveDueDate(arg: Task | Dateish): string | null {
  // If the argument is a Task, convert it into a Dateish shape first
  if (isTask(arg)) {
    const d: Dateish = {
      startDate: arg.startAt ?? undefined,
      endDate: arg.endAt ?? undefined,
      // Currently using endAt as the due date (switch if actual dueDate is added in the schema)
      dueDate: arg.endAt ?? undefined,
    };
    return getEffectiveDueDateFromDateish(d);
  }

  // If not a Task, treat it as a Dateish object
  return getEffectiveDueDateFromDateish(arg);
}

function isTask(x: unknown): x is Task {
  if (typeof x !== "object" || x === null) return false;
  return "taskId" in x && "taskStatus" in x;
}

/* ===================== Filters ===================== */

export interface FilterOptions {
  status?: ("To Do" | "In Progress" | "Done")[];
  priority?: ("Urgent" | "High" | "Normal" | "Low")[];
  assignees?: string[]; // Matches username/email/userId
  dateRange?: { from: Date | null; to: Date | null };
  eventTypes?: string[]; // (Unused in mock data for now)
  showCompleted?: boolean;
  showPersonalTasks?: boolean; // true = show tasks with eventId === null
}

/** Helper: extract searchable strings from a UserLite */
function assigneeKeys(a: UserLite): string[] {
  const keys: string[] = [];
  if (a.username) keys.push(a.username);
  if (a.email) keys.push(a.email);
  if (a.userId) keys.push(a.userId);
  return keys;
}

export const filterTasks = (
  tasks: Task[],
  searchTerm: string,
  filters: FilterOptions
): Task[] => {
  return tasks.filter((task) => {
    /* ----- Text Search ----- */
    if (searchTerm) {
      const q = searchTerm.toLowerCase();

      const titleHit = task.title.toLowerCase().includes(q);
      const descHit = task.description?.toLowerCase().includes(q) ?? false;
      const asgHit =
        task.assignees?.some((a) =>
          assigneeKeys(a).some((k) => k.toLowerCase().includes(q))
        ) ?? false;

      if (!(titleHit || descHit || asgHit)) return false;
    }

    /* ----- Status Filter ----- */
    if (filters.status?.length) {
      if (!filters.status.includes(task.taskStatus)) return false;
    }

    /* ----- Priority Filter ----- */
    if (filters.priority?.length) {
      if (!filters.priority.includes(task.taskPriority)) return false;
    }

    /* ----- Assignee Filter (username/email/userId) ----- */
    if (filters.assignees?.length) {
      const hasMatch =
        task.assignees?.some((a) =>
          assigneeKeys(a).some((key) => filters.assignees!.includes(key))
        ) ?? false;

      if (!hasMatch) return false;
    }

    /* ----- Date Range Filter (supports periods & single due dates) ----- */
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = filters.dateRange.to
        ? new Date(filters.dateRange.to)
        : new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);

      let overlaps = false;

      // If the task has a time period (startAt/endAt)
      if (task.startAt || task.endAt) {
        const start = task.startAt ? new Date(task.startAt) : null;
        const end = task.endAt ? new Date(task.endAt) : start;
        const s = start ?? new Date(0);
        const e = end ?? s;

        overlaps = s <= toDate && e >= fromDate;
      } else {
        // Regular tasks: use effective due date
        const eff = getEffectiveDueDate(task);
        if (eff) {
          const d = new Date(eff);
          overlaps = d >= fromDate && d <= toDate;
        }
      }

      if (!overlaps) return false;
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
