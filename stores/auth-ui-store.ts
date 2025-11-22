// stores/auth-ui-store.ts
import { create } from "zustand";

interface AuthState {
  // Forgot password
  forgotPassword: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
  // Login
  login: {
    isLoading: boolean;
    error: string | null;
  };
  // Sign up
  signUp: {
    isLoading: boolean;
    error: string | null;
  };
  // Update password
  updatePassword: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };

  // Actions
  setForgotPasswordLoading: (loading: boolean) => void;
  setForgotPasswordError: (error: string | null) => void;
  setForgotPasswordSuccess: (success: boolean) => void;
  resetForgotPasswordState: () => void;

  setLoginLoading: (loading: boolean) => void;
  setLoginError: (error: string | null) => void;
  resetLoginState: () => void;

  setSignUpLoading: (loading: boolean) => void;
  setSignUpError: (error: string | null) => void;
  resetSignUpState: () => void;

  setUpdatePasswordLoading: (loading: boolean) => void;
  setUpdatePasswordError: (error: string | null) => void;
  setUpdatePasswordSuccess: (success: boolean) => void;
  resetUpdatePasswordState: () => void;
}

export const useAuthUiStore = create<AuthState>((set) => ({
  // Initial state
  forgotPassword: { isLoading: false, error: null, success: false },
  login: { isLoading: false, error: null },
  signUp: { isLoading: false, error: null },
  updatePassword: { isLoading: false, error: null, success: false },

  // Forgot password actions
  setForgotPasswordLoading: (isLoading) =>
    set((state) => ({ forgotPassword: { ...state.forgotPassword, isLoading } })),
  setForgotPasswordError: (error) =>
    set((state) => ({ forgotPassword: { ...state.forgotPassword, error } })),
  setForgotPasswordSuccess: (success) =>
    set((state) => ({ forgotPassword: { ...state.forgotPassword, success } })),
  resetForgotPasswordState: () =>
    set({ forgotPassword: { isLoading: false, error: null, success: false } }),

  // Login actions
  setLoginLoading: (isLoading) =>
    set((state) => ({ login: { ...state.login, isLoading } })),
  setLoginError: (error) =>
    set((state) => ({ login: { ...state.login, error } })),
  resetLoginState: () =>
    set({ login: { isLoading: false, error: null } }),

  // Sign up actions
  setSignUpLoading: (isLoading) =>
    set((state) => ({ signUp: { ...state.signUp, isLoading } })),
  setSignUpError: (error) =>
    set((state) => ({ signUp: { ...state.signUp, error } })),
  resetSignUpState: () =>
    set({ signUp: { isLoading: false, error: null } }),

  // Update password actions
  setUpdatePasswordLoading: (isLoading) =>
    set((state) => ({ updatePassword: { ...state.updatePassword, isLoading } })),
  setUpdatePasswordError: (error) =>
    set((state) => ({ updatePassword: { ...state.updatePassword, error } })),
  setUpdatePasswordSuccess: (success) =>
    set((state) => ({ updatePassword: { ...state.updatePassword, success } })),
  resetUpdatePasswordState: () =>
    set({ updatePassword: { isLoading: false, error: null, success: false } }),
}));
