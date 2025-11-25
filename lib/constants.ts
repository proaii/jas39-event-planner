export const priorityColorMap: Record<string, string> = {
  Urgent: "bg-destructive text-destructive-foreground",
  High: "bg-warning text-warning-foreground",
  Normal: "bg-primary text-primary-foreground",
  Low: "bg-muted text-muted-foreground",
};

export const statusColorMap: Record<string, string> = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

export const MINUTES = {
  ONE: 1000 * 60,
  FIVE: 1000 * 60 * 5,
  TEN: 1000 * 60 * 10,
  THIRTY: 1000 * 60 * 30,
};

import { TaskPriority, TaskStatus, Subtask, Attachment } from './types';

export const initialTaskData: {
  title: string;
  description: string;
  startAt: string | null;
  endAt: string | null;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  subtasks: Subtask[];
  attachments: Attachment[];
  assignees: any[]; // UserLite[]
  hasTimePeriod: boolean;
} = {
  title: '',
  description: '',
  startAt: null,
  endAt: null,
  taskStatus: 'To Do',
  taskPriority: 'Normal',
  subtasks: [],
  attachments: [],
  assignees: [],
  hasTimePeriod: false,
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
