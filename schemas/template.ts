import { z } from "zod";

export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().nullable().optional(), 
  title: z.string(),
  location: z.string().nullable().optional(),    
  eventDescription: z.string().nullable().optional(), 
  coverImageUri: z.string().nullable().optional(),
  color: z.number(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  members: z.array(z.string()),
});

export type TemplateData = z.infer<typeof TemplateSchema>;
