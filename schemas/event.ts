import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  time: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  isMultiDay: z.boolean(),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  members: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  color: z.string().default("bg-chart-1"),
});

export type EventFormData = z.infer<typeof eventSchema>;
