import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  taskStatus: z.enum(["To Do", "In Progress", "Done"]),
  taskPriority: z.enum(["Urgent", "High", "Normal", "Low"]),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  assignees: z.array(z.string()).optional(),
});

export const TemplateSchema = z.object({
  name: z.string().min(1),
  title: z.string(),
  description: z.string().nullable().optional(),
  eventDescription: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  coverImageUri: z.string().nullable().optional(),
  color: z.number(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  members: z.array(z.string()),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().nullable().optional(),
      taskStatus: z.enum(["To Do","In Progress","Done"]),
      taskPriority: z.enum(["Urgent","High","Normal","Low"]),
      startAt: z.string().nullable().optional(),
      endAt: z.string().nullable().optional(),
      assignees: z.array(z.string())
    })
  ).optional() 
});


export type TemplateData = z.infer<typeof TemplateSchema>;
