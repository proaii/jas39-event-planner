import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ForgotPasswordState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

type EventView = "list" | "kanban";

interface UiStore {
  forgotPassword: ForgotPasswordState;
  setForgotPasswordLoading: (loading: boolean) => void;
  setForgotPasswordError: (error: string | null) => void;
  setForgotPasswordSuccess: (success: boolean) => void;
  resetForgotPasswordState: () => void;

  currentView: EventView;
  setCurrentView: (view: EventView) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      forgotPassword: { isLoading: false, error: null, success: false },

      setForgotPasswordLoading: (loading) =>
        set((state) => ({
          forgotPassword: { ...state.forgotPassword, isLoading: loading },
        })),
      setForgotPasswordError: (error) =>
        set((state) => ({
          forgotPassword: { ...state.forgotPassword, error },
        })),
      setForgotPasswordSuccess: (success) =>
        set((state) => ({
          forgotPassword: { ...state.forgotPassword, success },
        })),
      resetForgotPasswordState: () =>
        set({ forgotPassword: { isLoading: false, error: null, success: false } }),

      // Event view
      currentView: "list",
      setCurrentView: (view: EventView) => set({ currentView: view }),
    }),
    { name: "ui-store" }
  )
);
