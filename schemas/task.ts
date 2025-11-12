import { z } from "zod";

const subTaskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Sub-task name is required"),
  completed: z.boolean().default(false),
});

const attachmentSchema = z.object({
  id: z.string(),
  url: z.string().url("Invalid URL"),
  title: z.string(),
  favicon: z.string().optional(),
});

// Updated to reflect latest UserLite type
const userLiteSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assignees: z.array(userLiteSchema).min(1, "At least one assignee required"),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]).default("To Do"),
  priority: z.enum(["Urgent", "High", "Normal", "Low"]).default("Normal"),
  subTasks: z.array(subTaskSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  isPersonal: z.boolean().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
