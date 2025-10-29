import { Task, Event, Activity } from "@/lib/types";
import { addDays, subDays, formatISO } from "date-fns";

const now = new Date();

// Mock Data
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design the new landing page",
    status: "In Progress",
    priority: "High",
    dueDate: formatISO(addDays(now, 5)),
    assignees: ["Bob"],
    createdAt: formatISO(subDays(now, 1)), // added createdAt
  },
  {
    id: "2",
    title: "Develop the API for the new feature",
    status: "To Do",
    priority: "Urgent",
    dueDate: formatISO(addDays(now, 2)),
    assignees: ["Bob"],
    createdAt: formatISO(subDays(now, 2)),
  },
  {
    id: "3",
    title: "Write the documentation for the API",
    status: "To Do",
    priority: "Normal",
    dueDate: formatISO(addDays(now, 10)),
    assignees: ["Bob"],
    createdAt: formatISO(subDays(now, 3)),
  },
  {
    id: "4",
    title: "Test the new feature",
    status: "Done",
    priority: "High",
    dueDate: formatISO(subDays(now, 2)),
    assignees: ["Bob"],
    createdAt: formatISO(subDays(now, 5)),
  },
];


export const mockEvents: Event[] = [
  {
    id: "1",
    ownerId: "1",
    title: "Quarterly Business Review",
    date: formatISO(addDays(now, 2)),
    time: "10:00",
    location: "Boardroom A",
    description: "Review of Q3 performance and planning for Q4.",
    progress: 60,
    tasks: [],
    members: ["Alice", "Bob", "Charlie"],
    color: "#4A90E2",
    createdAt: formatISO(subDays(now, 5)),
    endDate: undefined,
    endTime: undefined,
    isMultiDay: false,
    coverImage: undefined,
  },
  {
    id: "2",
    ownerId: "1",
    title: "New Feature Launch Party",
    date: formatISO(addDays(now, 10)),
    time: "18:00",
    location: "Main Hall",
    description: "Celebrating the launch of our new feature.",
    progress: 25,
    tasks: [],
    members: ["Alice", "David", "Eve"],
    color: undefined,
    createdAt: formatISO(subDays(now, 3)),
    endDate: undefined,
    endTime: undefined,
    isMultiDay: false,
    coverImage: undefined,
  },
];

export const mockActivities: Activity[] = [
  { id: "1", user: "Sarah Chen", action: "completed", item: "Invite speakers", time: "2h ago" },
  { id: "2", user: "Michael Brown", action: "was assigned to", item: "Setup registration", time: "4h ago" },
  { id: "3", user: "Emily Davis", action: "commented on", item: "Hackathon 2025", time: "1d ago" },
  { id: "4", user: "Alice", action: "created event", item: "New Feature Launch Party", time: "2d ago" },
];
