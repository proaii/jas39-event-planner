import { z } from "zod";

export const editEventSchema = z.object({
  title: z.string().min(1).default(""),
  location: z.string().optional(),
  description: z.string().optional(),
  coverImageUri: z.string().optional(),
  color: z.number(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  members: z.array(z.string()).default([]),
});