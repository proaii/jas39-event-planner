"use client";

import { create } from "zustand";
import { z } from "zod";

// ----------------- Zod Schemas -----------------
export const attachmentSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  favicon: z.string().optional(),
});

export type Attachment = z.infer<typeof attachmentSchema>;

// ----------------- Zustand Store -----------------
interface AttachmentStore {
  attachments: Attachment[];
  maxItems?: number;
  showHeader: boolean;
  compact: boolean;
  setAttachments: (items: Attachment[]) => void;
  setMaxItems: (max?: number) => void;
  setShowHeader: (show: boolean) => void;
  setCompact: (compact: boolean) => void;
}

export const useAttachmentStore = create<AttachmentStore>((set) => ({
  attachments: [],
  maxItems: undefined,
  showHeader: true,
  compact: false,
  setAttachments: (items) => {
    const parsed = z.array(attachmentSchema).safeParse(items);
    if (parsed.success) set({ attachments: parsed.data });
    else console.warn("Invalid attachments:", parsed.error.format());
  },
  setMaxItems: (max) => set({ maxItems: max }),
  setShowHeader: (show) => set({ showHeader: show }),
  setCompact: (compact) => set({ compact }),
}));
