import { z } from "zod";

export const editEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  location: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  coverImageUri: z.string().optional(),
  color: z.number(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  members: z.array(
    z.object({
      eventMemberId: z.string(),
      eventId: z.string(),
      userId: z.string(),
      joinedAt: z.string(),
      role: z.string().optional(), 
    })
  ),
});
