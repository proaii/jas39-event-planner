"use client";

import { create } from "zustand";
import { z } from "zod";

// ----------------- Zod Schemas -----------------
export const SubTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  completed: z.boolean(),
});

export const AttachmentSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  favicon: z.string().optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  assignees: z.array(z.string()),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Urgent", "High", "Normal", "Low"]),
  subTasks: z.array(SubTaskSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  isPersonal: z.boolean().optional(),
});

export const BoardCustomizationSchema = z.object({
  showAssignees: z.boolean(),
  showDueDates: z.boolean(),
  showPriority: z.boolean(),
  showSubTaskProgress: z.boolean(),
  showAttachments: z.boolean(),
});

// ----------------- Types -----------------
export type Task = z.infer<typeof TaskSchema>;
export type BoardCustomization = z.infer<typeof BoardCustomizationSchema>;

// ----------------- Zustand Store -----------------
interface KanbanStore {
  customization: BoardCustomization;
  setCustomization: (update: Partial<BoardCustomization>) => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  customization: {
    showAssignees: true,
    showDueDates: true,
    showPriority: true,
    showSubTaskProgress: true,
    showAttachments: true,
  },
  setCustomization: (update) =>
    set((state) => ({ customization: { ...state.customization, ...update } })),
}));
