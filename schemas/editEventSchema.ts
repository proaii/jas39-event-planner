import { z } from "zod";

export const editEventSchema = z.object({
  title: z.string().min(1).default(""),
  date: z.string().min(1).default(""),
  endDate: z.string().default(""),      
  time: z.string().min(1).default(""),
  endTime: z.string().default(""),      
  isMultiDay: z.boolean().default(false),
  location: z.string().min(1).default(""),
  description: z.string().default(""),
  members: z.array(z.string()).default([]),
  coverImage: z.string().default(""),
  color: z.string().default("#E8F4FD"),
});

