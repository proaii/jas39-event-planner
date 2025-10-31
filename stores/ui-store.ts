"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

// ----------------- Zod Schemas -----------------
const ProgressFiltersSchema = z.object({
  notStarted: z.boolean(),
  inProgress: z.boolean(),
  completed: z.boolean(),
});

const DateFiltersSchema = z.object({
  past: z.boolean(),
  thisWeek: z.boolean(),
  thisMonth: z.boolean(),
  upcoming: z.boolean(),
});

const UiStateSchema = z.object({
  isAddEventModalOpen: z.boolean(),
  isAddTaskModalOpen: z.boolean(),
  isCustomizeModalOpen: z.boolean(),
  isTemplateModalOpen: z.boolean(),
  isSaveTemplateModalOpen: z.boolean(),
  isDeleteEventDialogOpen: z.boolean(),

  defaultWidgets: z.array(z.string()),
  visibleWidgets: z.array(z.string()),

  searchQuery: z.string(),
  sortBy: z.enum(["date", "name", "progress"]),
  isFilterOpen: z.boolean(),
  progressFilters: ProgressFiltersSchema,
  dateFilters: DateFiltersSchema,
});

export type UiState = z.infer<typeof UiStateSchema>;

// ----------------- Zustand Store -----------------
interface UiStore extends UiState {
  // Modal actions
  openAddEventModal: () => void;
  closeAddEventModal: () => void;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  openCustomizeModal: () => void;
  closeCustomizeModal: () => void;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  openSaveTemplateModal: () => void;
  closeSaveTemplateModal: () => void;
  openDeleteEventDialog: () => void;
  closeDeleteEventDialog: () => void;

  // Widget actions
  setVisibleWidgets: (widgets: string[]) => void;
  resetWidgets: () => void;

  // Filter/Search actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "date" | "name" | "progress") => void;
  setIsFilterOpen: (open: boolean) => void;
  setProgressFilters: (filters: Partial<UiState["progressFilters"]>) => void;
  setDateFilters: (filters: Partial<UiState["dateFilters"]>) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      isAddEventModalOpen: false,
      isAddTaskModalOpen: false,
      isCustomizeModalOpen: false,
      isTemplateModalOpen: false,
      isSaveTemplateModalOpen: false,
      isDeleteEventDialogOpen: false,

      defaultWidgets: ["upcomingEvents", "recentActivity", "upcomingDeadlines", "progressOverview"],
      visibleWidgets: ["upcomingEvents", "recentActivity", "upcomingDeadlines", "progressOverview"],

      searchQuery: "",
      sortBy: "date",
      isFilterOpen: false,
      progressFilters: { notStarted: true, inProgress: true, completed: true },
      dateFilters: { past: true, thisWeek: true, thisMonth: true, upcoming: true },

      openAddEventModal: () => set({ isAddEventModalOpen: true }),
      closeAddEventModal: () => set({ isAddEventModalOpen: false }),
      openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
      closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),
      openCustomizeModal: () => set({ isCustomizeModalOpen: true }),
      closeCustomizeModal: () => set({ isCustomizeModalOpen: false }),
      openTemplateModal: () => set({ isTemplateModalOpen: true }),
      closeTemplateModal: () => set({ isTemplateModalOpen: false }),
      openSaveTemplateModal: () => set({ isSaveTemplateModalOpen: true }),
      closeSaveTemplateModal: () => set({ isSaveTemplateModalOpen: false }),
      openDeleteEventDialog: () => set({ isDeleteEventDialogOpen: true }),
      closeDeleteEventDialog: () => set({ isDeleteEventDialogOpen: false }),

      setVisibleWidgets: (widgets) => set({ visibleWidgets: widgets }),
      resetWidgets: () => set({ visibleWidgets: get().defaultWidgets }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setIsFilterOpen: (open) => set({ isFilterOpen: open }),
      setProgressFilters: (filters) =>
        set((state) => ({ progressFilters: { ...state.progressFilters, ...filters } })),
      setDateFilters: (filters) =>
        set((state) => ({ dateFilters: { ...state.dateFilters, ...filters } })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        isAddEventModalOpen: state.isAddEventModalOpen,
        visibleWidgets: state.visibleWidgets,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        progressFilters: state.progressFilters,
        dateFilters: state.dateFilters,
      }),
    }
  )
);
