"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  // ----- Modals -----
  isAddEventModalOpen: boolean;
  isAddTaskModalOpen: boolean;
  isCustomizeModalOpen: boolean;

  // ----- Dashboard -----
  defaultWidgets: string[];
  visibleWidgets: string[];

  // ----- Actions -----
  openAddEventModal: () => void;
  closeAddEventModal: () => void;

  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;

  openCustomizeModal: () => void;
  closeCustomizeModal: () => void;

  setVisibleWidgets: (widgets: string[]) => void;
  resetWidgets: () => void;
}

// Use `persist` to retain the selected widget layout even after page refresh
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      // ----- Initial state -----
      isAddEventModalOpen: false,
      isAddTaskModalOpen: false,
      isCustomizeModalOpen: false,

      defaultWidgets: [
        "upcomingEvents",
        "recentActivity",
        "upcomingDeadlines",
        "progressOverview",
      ],
      visibleWidgets: [
        "upcomingEvents",
        "recentActivity",
        "upcomingDeadlines",
        "progressOverview",
      ],

      // ----- Modal actions -----
      openAddEventModal: () => set({ isAddEventModalOpen: true }),
      closeAddEventModal: () => set({ isAddEventModalOpen: false }),

      openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
      closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),

      openCustomizeModal: () => set({ isCustomizeModalOpen: true }),
      closeCustomizeModal: () => set({ isCustomizeModalOpen: false }),

      // ----- Widget actions -----
      setVisibleWidgets: (widgets) => set({ visibleWidgets: widgets }),
      resetWidgets: () => set({ visibleWidgets: get().defaultWidgets }),
    }),
    {
      name: "ui-store", // key for localStorage
    }
  )
);
