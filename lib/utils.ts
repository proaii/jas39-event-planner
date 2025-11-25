import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, TaskStatus } from "@/lib/types";

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
  tasks: Task[],
  query: string,
  filters: { notStarted: boolean; inProgress: boolean; completed: boolean }
) => {
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

// Generate a random ID for temporary use (e.g., subtasks, attachments)
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Extract title from URL based on hostname
export const extractTitleFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('docs.google.com')) return 'Google Doc'
    if (urlObj.hostname.includes('figma.com')) return 'Figma Design'
    if (urlObj.hostname.includes('github.com')) return 'GitHub Repository'
    if (urlObj.hostname.includes('drive.google.com')) return 'Google Drive File'
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Link'
  }
}

// Get favicon emoji from URL based on hostname
export const getFaviconFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('docs.google.com')) return '📄'
    if (urlObj.hostname.includes('figma.com')) return '🎨'
    if (urlObj.hostname.includes('github.com')) return '💻'
    if (urlObj.hostname.includes('drive.google.com')) return '📂'
    return '🔗'
  } catch {
    return '🔗'
  }
}

// Format a full date string (e.g., "Monday, January 1, 2023")
export const formatFullDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format a date and time string (e.g., "January 1, 2023, 10:30 AM")
export const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};