"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface EventColorStore {
  selectedColor: string | null;
  setColor: (color: string) => void;
}

export const useEventColorStore = create<EventColorStore>()(
  devtools((set) => ({
    selectedColor: null,
    setColor: (color) => set({ selectedColor: color }),
  }))
);
