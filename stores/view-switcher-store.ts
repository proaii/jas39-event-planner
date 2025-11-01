"use client";

import { create } from "zustand";

// ----------------- Zustand Store -----------------
export type ViewType = "list" | "board";

interface ViewSwitcherStore {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const useViewSwitcherStore = create<ViewSwitcherStore>((set) => ({
  currentView: "list",
  setView: (view) => set({ currentView: view }),
}));
