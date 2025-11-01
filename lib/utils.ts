import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task } from "@/lib/types";

// Combine Tailwind class names safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if Supabase environment variables exist
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get initials from a name string
export const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

// Format date as "MMM dd, yyyy"
export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format time string "HH:mm" to "h:mm AM/PM"
export const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const displayHour = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:${minutes} ${ampm}`;
};

// Format task due date with urgency flags
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

// Get effective due date for a task
export const getEffectiveDueDate = (task: { endAt?: string | null; dueDate?: string | null }): string | undefined => {
  // Prefer endAt over dueDate if both exist
  if (task.endAt) return task.endAt;
  return task.dueDate || undefined;
};
