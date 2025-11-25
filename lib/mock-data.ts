import type { Task, Event, UserLite, Attachment, Subtask } from "@/lib/types";
import { addDays, subDays } from "date-fns";

const now = new Date();
const iso = (d: Date) => d.toISOString();

/** ------- Mock users (UserLite) ------- */
export const mockUsers: Record<string, UserLite> = {
  u1: { userId: "u1", username: "Alice", email: "alice@example.com", avatarUrl: null },
  u2: { userId: "u2", username: "Bob",   email: "bob@example.com",   avatarUrl: null },
  u3: { userId: "u3", username: "Charlie", email: "charlie@example.com", avatarUrl: null },
};

/** ------- Mock attachments/subtasks helpers ------- */
const att = (id: string, taskId: string, url: string): Attachment => ({
  attachmentId: id,
  taskId,
  attachmentUrl: url,
});

const st = (id: string, taskId: string, title: string, done = false): Subtask => ({
  subtaskId: id,
  taskId,
  title,
  subtaskStatus: done ? "Done" : "To Do",
});

/** ------- Mock tasks (Task[]) ------- */
export const mockTasks: Task[] = [
  {
    taskId: "t1",
    eventId: "e1",
    creatorId: "u1",
    title: "Design the new landing page",
    description: "Hero, pricing, and CTA sections",
    taskStatus: "In Progress",
    taskPriority: "High",
    startAt: iso(now),
    endAt: iso(addDays(now, 5)),       // ใช้เป็น due
    createdAt: iso(subDays(now, 2)),
    assignees: [mockUsers.u2],         // Bob
    subtasks: [st("st1", "t1", "Wireframe"), st("st2", "t1", "Mockup", true)],
    attachments: [att("a1", "t1", "https://example.com/landing-spec")],
  },
  {
    taskId: "t2",
    eventId: "e1",
    creatorId: "u1",
    title: "Develop the API for the new feature",
    taskStatus: "To Do",
    taskPriority: "Urgent",
    startAt: iso(now),
    endAt: iso(addDays(now, 2)),
    createdAt: iso(subDays(now, 1)),
    assignees: [mockUsers.u2],
    subtasks: [],
    attachments: [],
  },
  {
    taskId: "t3",
    eventId: null,                     // personal task
    creatorId: "u1",
    title: "Write the documentation for the API",
    taskStatus: "To Do",
    taskPriority: "Normal",
    startAt: iso(now),
    endAt: iso(addDays(now, 10)),
    createdAt: iso(now),
    assignees: [mockUsers.u2],
    subtasks: [],
    attachments: [],
  },
  {
    taskId: "t4",
    eventId: "e2",
    creatorId: "u1",
    title: "Test the new feature",
    taskStatus: "Done",
    taskPriority: "High",
    startAt: iso(subDays(now, 4)),
    endAt: iso(subDays(now, 2)),
    createdAt: iso(subDays(now, 5)),
    assignees: [mockUsers.u2],
    subtasks: [],
    attachments: [],
  },
];

/** ------- Mock events (Event[]) ------- */
export const mockEvents: Event[] = [
  {
    eventId: "e1",
    ownerId: "u1",
    title: "Quarterly Business Review",
    location: "Boardroom A",
    description: "Review of Q3 performance and planning for Q4.",
    coverImageUri: undefined,
    color: 0,                           // number (เช่น index palette)
    createdAt: iso(subDays(now, 5)),
    startAt: iso(addDays(now, 2)),
    endAt: iso(addDays(now, 2)),
    members: ["u1", "u2", "u3"],        // userId[]
  },
  {
    eventId: "e2",
    ownerId: "u1",
    title: "New Feature Launch Party",
    location: "Main Hall",
    description: "Celebrating the launch of our new feature.",
    coverImageUri: undefined,
    color: 1,
    createdAt: iso(subDays(now, 3)),
    startAt: iso(addDays(now, 10)),
    endAt: iso(addDays(now, 10)),
    members: ["u1", "u2"],
  },
];

/** (ถ้าต้องใช้) mock กิจกรรม */
export interface Activity {
  id: string;
  user: string;
  action: string;
  item: string;
  time: string;
}
export const mockActivities: Activity[] = [
  { id: "ac1", user: "Sarah Chen",   action: "completed",     item: "Invite speakers",        time: "2h ago" },
  { id: "ac2", user: "Michael Brown", action: "was assigned to", item: "Setup registration", time: "4h ago" },
  { id: "ac3", user: "Emily Davis",  action: "commented on",  item: "Hackathon 2025",         time: "1d ago" },
  { id: "ac4", user: "Alice",        action: "created event", item: "New Feature Launch Party", time: "2d ago" },
];
