import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDueDate = (dueDate?: string | null) => {
  if (!dueDate) return null;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
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

export const getEffectiveDueDate = (task: Task): string | undefined => {
  if (task.startDate && task.endDate) return task.endDate;
  if (task.dueDate) return task.dueDate;
  return undefined;
};
