"use client";

import { create } from "zustand";

// Widget identifiers used in dashboard
export const DEFAULT_WIDGETS = [
  "upcomingEvents",
  "upcomingDeadlines",
  "recentActivity",
  "progressOverview",
] as const;

export type DashboardWidget = (typeof DEFAULT_WIDGETS)[number];

// ----------------------------
// UI STORE
// ----------------------------
interface DashboardUiState {
  // ---- Customize Modal ----
  isCustomizeOpen: boolean;
  openCustomize: () => void;
  closeCustomize: () => void;

  // ---- Widget Config ----
  visibleWidgets: DashboardWidget[];
  tempWidgets: DashboardWidget[];

  setTempWidgets: (
    updater:
      | DashboardWidget[]
      | ((prev: DashboardWidget[]) => DashboardWidget[])
  ) => void;

  saveWidgetConfig: () => void;
  resetWidgetConfig: () => void;

  // ---- Loading / Errors (DashboardWidgets.tsx)
  isLoading: boolean;
  error: string | null;

  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
}

// ----------------------------------
// Zustand Store
// ----------------------------------
export const useDashboardUiStore = create<DashboardUiState>((set, get) => ({
  // -------------------
  // Modal
  // -------------------
  isCustomizeOpen: false,
  openCustomize: () => set({ isCustomizeOpen: true }),
  closeCustomize: () => set({ isCustomizeOpen: false }),

  // -------------------
  // Widgets
  // -------------------
  visibleWidgets: [...DEFAULT_WIDGETS], // final saved config
  tempWidgets: [...DEFAULT_WIDGETS], // temp while editing

  setTempWidgets: (updater) =>
    set((state) => ({
      tempWidgets:
        typeof updater === "function"
          ? updater(state.tempWidgets)
          : updater,
    })),

  saveWidgetConfig: () =>
    set((state) => ({
      visibleWidgets: [...state.tempWidgets],
      isCustomizeOpen: false,
    })),

  resetWidgetConfig: () =>
    set(() => ({
      tempWidgets: [...DEFAULT_WIDGETS],
    })),

  // -------------------
  // Loading / Error
  // -------------------
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
}));
