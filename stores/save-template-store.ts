"use client";

import { create } from "zustand";
import { z } from "zod";

// ----------------- Zod Schema -----------------
export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
});

export type TemplateData = z.infer<typeof TemplateSchema>;

// ----------------- Zustand Store -----------------
interface SaveTemplateStore {
  isOpen: boolean;
  templateData: TemplateData;
  setOpen: (open: boolean) => void;
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  reset: () => void;
}

export const useSaveTemplateStore = create<SaveTemplateStore>((set) => ({
  isOpen: false,
  templateData: { name: "", description: "" },
  setOpen: (open) => set({ isOpen: open }),
  setName: (name) =>
    set((state) => ({ templateData: { ...state.templateData, name } })),
  setDescription: (description) =>
    set((state) => ({ templateData: { ...state.templateData, description } })),
  reset: () => set({ isOpen: false, templateData: { name: "", description: "" } }),
}));
