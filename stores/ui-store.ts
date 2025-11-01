"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

// ----------------- Zod Schemas -----------------
const ProgressFiltersSchema = z.object({
  notStarted: z.boolean().default(true),
  inProgress: z.boolean().default(true),
  completed: z.boolean().default(true),
});

const DateFiltersSchema = z.object({
  past: z.boolean().default(true),
  thisWeek: z.boolean().default(true),
  thisMonth: z.boolean().default(true),
  upcoming: z.boolean().default(true),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UiStateSchema = z.object({
  // ----- Modals -----
  isAddEventModalOpen: z.boolean().default(false),
  isEditEventModalOpen: z.boolean().default(false),
  isAddTaskModalOpen: z.boolean().default(false),
  isCustomizeModalOpen: z.boolean().default(false),
  isTemplateModalOpen: z.boolean().default(false),
  isSaveTemplateModalOpen: z.boolean().default(false),
  isDeleteEventDialogOpen: z.boolean().default(false),

  // ----- Widgets -----
  defaultWidgets: z
    .array(z.string())
    .default(["upcomingEvents", "recentActivity", "upcomingDeadlines", "progressOverview"]),
  visibleWidgets: z
    .array(z.string())
    .default(["upcomingEvents", "recentActivity", "upcomingDeadlines", "progressOverview"]),

  // ----- Filters -----
  searchQuery: z.string().default(""),
  sortBy: z.enum(["date", "name", "progress"]).default("date"),
  isFilterOpen: z.boolean().default(false),
  progressFilters: ProgressFiltersSchema,
  dateFilters: DateFiltersSchema,

  // ----- Edit Event -----
  currentEventId: z.string().nullable().default(null),
});

export type UiState = z.infer<typeof UiStateSchema>;

// ----------------- Zustand Store -----------------
interface UiStore extends UiState {
  // ----- Modal actions -----
  openAddEventModal: () => void;
  closeAddEventModal: () => void;

  openEditEventModal: (id: string) => void;
  closeEditEventModal: () => void;

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

  // ----- Widget actions -----
  setVisibleWidgets: (widgets: string[]) => void;
  resetWidgets: () => void;

  // ----- Filter/Search actions -----
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "date" | "name" | "progress") => void;
  setIsFilterOpen: (open: boolean) => void;
  setProgressFilters: (filters: Partial<UiState["progressFilters"]>) => void;
  setDateFilters: (filters: Partial<UiState["dateFilters"]>) => void;
}

// ----------------- Store Implementation -----------------
export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      // ----- Initial State -----
      isAddEventModalOpen: false,
      isEditEventModalOpen: false,
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

      currentEventId: null,

      // ----- Modal Actions -----
      openAddEventModal: () => set({ isAddEventModalOpen: true }),
      closeAddEventModal: () => set({ isAddEventModalOpen: false }),

      openEditEventModal: (id: string) =>
        set({
          isEditEventModalOpen: true,
          currentEventId: id,
        }),

      closeEditEventModal: () =>
        set({
          isEditEventModalOpen: false,
          currentEventId: null,
        }),

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

      // ----- Widget Actions -----
      setVisibleWidgets: (widgets) => set({ visibleWidgets: widgets }),
      resetWidgets: () => set({ visibleWidgets: get().defaultWidgets }),

      // ----- Filter/Search Actions -----
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setIsFilterOpen: (open) => set({ isFilterOpen: open }),
      setProgressFilters: (filters) =>
        set((state) => ({
          progressFilters: { ...state.progressFilters, ...filters },
        })),
      setDateFilters: (filters) =>
        set((state) => ({
          dateFilters: { ...state.dateFilters, ...filters },
        })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        visibleWidgets: state.visibleWidgets,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        progressFilters: state.progressFilters,
        dateFilters: state.dateFilters,
      }),
    }
  )
);
