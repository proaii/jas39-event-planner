import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, TaskStatus, Event } from "@/lib/types";

// ------------------- ClassNames -------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------- Env Check -------------------
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ------------------- Name / Date Utils -------------------
export const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const displayHour = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:${minutes} ${ampm}`;
};

// ------------------- Task Due Date -------------------
export const formatDueDate = (dueDate?: string | null) => {
  if (!dueDate) return null;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dueDateTime = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  dueDateTime.setHours(0, 0, 0, 0);
  const isToday = dueDateTime.getTime() === today.getTime();
  const isTomorrow = dueDateTime.getTime() === tomorrow.getTime();
  const isUrgent = isToday || isTomorrow;
  const formattedDate = dueDateTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    text: `Due: ${formattedDate}`,
    isUrgent,
    isToday,
    isTomorrow,
  };
};

export const getEffectiveDueDate = (task: { endAt?: string | null; dueDate?: string | null }): string | undefined => {
  if (task.endAt) return task.endAt;
  return task.dueDate || undefined;
};

// ------------------- Filter & Sort Tasks -------------------
export const filterTasks = (
  tasks: Task[] | undefined | null,
  query: string,
  filters: { notStarted: boolean; inProgress: boolean; completed: boolean }
) => {
  if (!tasks || !Array.isArray(tasks)) return []; 

  let filtered = tasks;

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  if (!filters.notStarted) filtered = filtered.filter(t => t.taskStatus !== "To Do");
  if (!filters.inProgress) filtered = filtered.filter(t => t.taskStatus !== "In Progress");
  if (!filters.completed) filtered = filtered.filter(t => t.taskStatus !== "Done");

  return filtered;
};


export const sortTasks = (tasks: Task[], sortBy: "name" | "date" | "progress") => {
  const sorted = [...tasks];
  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "date") {
    sorted.sort((a, b) => {
      const dateA = getEffectiveDueDate(a) ? new Date(getEffectiveDueDate(a)!).getTime() : Infinity;
      const dateB = getEffectiveDueDate(b) ? new Date(getEffectiveDueDate(b)!).getTime() : Infinity;
      return dateA - dateB;
    });
  } else if (sortBy === "progress") {
    const order: Record<TaskStatus, number> = { "To Do": 0, "In Progress": 1, "Done": 2 };
    sorted.sort((a, b) => order[a.taskStatus] - order[b.taskStatus]);
  }
  return sorted;
};

// ------------------- Event Progress Calculation -------------------
export const calculateEventProgress = (event: Event): number => {
  // Return 0 if dates are missing
  if (!event.startAt || !event.endAt) return 0;
  
  // Calculate progress based on time elapsed
  const now = new Date();
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  
  // If event hasn't started yet
  if (now < start) return 0;
  
  // If event has ended
  if (now > end) return 100;
  
  // Calculate progress based on time elapsed
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progress = Math.floor((elapsed / totalDuration) * 100);
  
  return Math.max(0, Math.min(100, progress));
};

// ------------------- Filter & Sort Events -------------------
export const filterEvents = (
  events: Event[],
  query: string,
  progressFilters: { notStarted: boolean; inProgress: boolean; completed: boolean },
  dateFilters: { past: boolean; thisWeek: boolean; thisMonth: boolean; upcoming: boolean }
) => {
  let filtered = events;

  // Search filter
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.description && event.description.toLowerCase().includes(q)) ||
        (event.location && event.location.toLowerCase().includes(q))
    );
  }

  // Progress filters
  if (!progressFilters.notStarted || !progressFilters.inProgress || !progressFilters.completed) {
    filtered = filtered.filter((event) => {
      const progress = calculateEventProgress(event);
      
      if (progress === 0 && !progressFilters.notStarted) return false;
      if (progress > 0 && progress < 100 && !progressFilters.inProgress) return false;
      if (progress === 100 && !progressFilters.completed) return false;
      
      return true;
    });
  }

  // Date filters
  if (!dateFilters.past || !dateFilters.thisWeek || !dateFilters.thisMonth || !dateFilters.upcoming) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);
    
    const monthFromNow = new Date(now);
    monthFromNow.setMonth(now.getMonth() + 1);

    filtered = filtered.filter((event) => {
      // Skip events without dates
      if (!event.startAt || !event.endAt) return true;
      
      const eventStart = new Date(event.startAt);
      eventStart.setHours(0, 0, 0, 0);
      
      const eventEnd = new Date(event.endAt);
      eventEnd.setHours(23, 59, 59, 999);
      
      // Categorize event
      const isPast = eventEnd < now;
      const isThisWeek = !isPast && eventStart <= weekFromNow;
      const isThisMonth = !isPast && !isThisWeek && eventStart <= monthFromNow;
      const isUpcoming = !isPast && !isThisWeek && !isThisMonth;

      if (isPast && !dateFilters.past) return false;
      if (isThisWeek && !dateFilters.thisWeek) return false;
      if (isThisMonth && !dateFilters.thisMonth) return false;
      if (isUpcoming && !dateFilters.upcoming) return false;
      
      return true;
    });
  }

  return filtered;
};

export const sortEvents = (events: Event[], sortBy: "date" | "name" | "progress") => {
  const sorted = [...events];

  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "date") {
    sorted.sort((a, b) => {
      // Handle null/undefined dates - put them at the end
      if (!a.startAt && !b.startAt) return 0;
      if (!a.startAt) return 1;
      if (!b.startAt) return -1;
      
      const dateA = new Date(a.startAt).getTime();
      const dateB = new Date(b.startAt).getTime();
      return dateA - dateB;
    });
  } else if (sortBy === "progress") {
    // Sort by progress (high to low)
    sorted.sort((a, b) => {
      const progressA = calculateEventProgress(a);
      const progressB = calculateEventProgress(b);
      return progressB - progressA;
    });
  }

  return sorted;
};