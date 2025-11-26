// stores/ui-store.ts 
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Event } from "@/lib/types";

// Widget identifiers
export const DEFAULT_WIDGETS = [
  "upcomingEvents",
  "upcomingDeadlines",
  "recentActivity",
  "progressOverview",
] as const;

export type DashboardWidget = (typeof DEFAULT_WIDGETS)[number];
type EventView = "list" | "kanban";

// Settings types
interface ProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface NotificationSettings {
  email: boolean;
  inApp: boolean;
}

interface AppearanceSettings {
  compactView: boolean;
}

interface PrivacySettings {
  profileVisibility: boolean;
  activityTracking: boolean;
}

// Task Filter Types
interface ProgressFilters {
  notStarted: boolean;
  inProgress: boolean;
  completed: boolean;
}

interface DateFilters {
  past: boolean;
  thisWeek: boolean;
  thisMonth: boolean;
  upcoming: boolean;
}

interface UiStore {
  // ==================== FORGOT PASSWORD ====================
  forgotPassword: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
  setForgotPasswordLoading: (loading: boolean) => void;
  setForgotPasswordError: (error: string | null) => void;
  setForgotPasswordSuccess: (success: boolean) => void;
  resetForgotPasswordState: () => void;

  // ==================== EVENT VIEW ====================
  currentView: EventView;
  setCurrentView: (view: EventView) => void;

  // ==================== MODALS ====================
  // Add Event Modal
  isAddEventModalOpen: boolean;
  openAddEventModal: () => void;
  closeAddEventModal: () => void;

  // Edit Event Modal (with event selection)
  isEditEventModalOpen: boolean;
  selectedEventIdForEdit: string | null;
  openEditEventModal: (eventId: string) => void;
  closeEditEventModal: () => void;

  // Add Task Modal
  isAddTaskModalOpen: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;

  // Edit Task Modal
  isEditTaskModalOpen: boolean;
  selectedTaskIdForEdit: string | null;
  openEditTaskModal: (taskId: string) => void;
  closeEditTaskModal: () => void;

  // Customize Dashboard Modal
  isCustomizeModalOpen: boolean;
  openCustomizeModal: () => void;
  closeCustomizeModal: () => void;

  // Save Template Modal
  isSaveTemplateModalOpen: boolean;
  openSaveTemplateModal: () => void;
  closeSaveTemplateModal: () => void;

  // Create From Template Modal
  isCreateFromTemplateModalOpen: boolean;
  openCreateFromTemplateModal: () => void;
  closeCreateFromTemplateModal: () => void;

  // Edit Profile Modal
  isEditProfileModalOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

 // Template Modal 
  isTemplateModalOpen: boolean;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;

  // ==================== TEMPLATE PREFILL DATA ====================
  eventPrefillData: Partial<Event> | null;
  setEventPrefillData: (data: Partial<Event> | null) => void;
  clearEventPrefillData: () => void;

  // ==================== TASK FILTERS ====================
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "date" | "name" | "progress";
  setSortBy: (sort: "date" | "name" | "progress") => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  progressFilters: ProgressFilters;
  setProgressFilters: (filters: ProgressFilters) => void;
  dateFilters: DateFilters;
  setDateFilters: (filters: DateFilters) => void;

  // ==================== DASHBOARD WIDGETS ====================
  visibleWidgets: DashboardWidget[];
  tempWidgets: DashboardWidget[];
  setTempWidgets: (
    updater:
      | DashboardWidget[]
      | ((prev: DashboardWidget[]) => DashboardWidget[])
  ) => void;
  setVisibleWidgets: (widgets: DashboardWidget[]) => void;
  saveWidgetConfig: () => void;
  resetWidgets: () => void;

  // ==================== SETTINGS ====================
  // Profile Data
  profileData: ProfileData;
  tempProfileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  setTempProfileData: (data: ProfileData | ((prev: ProfileData) => ProfileData)) => void;
  saveProfileData: () => void;
  resetTempProfileData: () => void;
  initializeProfileData: (username: string, email: string) => void;

  // Notification Settings
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;

  // Appearance Settings
  appearanceSettings: AppearanceSettings;
  setAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;

  // Privacy Settings
  privacySettings: PrivacySettings;
  setPrivacySettings: (settings: Partial<PrivacySettings>) => void;

  // ==================== LOADING & ERROR ====================
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // ==================== UTILITY ====================
  resetAllModals: () => void;
}

// Helper function
const parseFullName = (fullName: string): Pick<ProfileData, 'firstName' | 'middleName' | 'lastName'> => {
  const parts = fullName.trim().split(" ");
  return {
    firstName: parts[0] || "",
    middleName: parts.length === 3 ? parts[1] : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};

const DEFAULT_PROFILE_DATA: ProfileData = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      // ==================== TEMPLATE MODAL ====================
      isTemplateModalOpen: false,
      openTemplateModal: () => set({ isTemplateModalOpen: true }),
      closeTemplateModal: () => set({ isTemplateModalOpen: false }),

      // ==================== FORGOT PASSWORD ====================
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

      // ==================== EVENT VIEW ====================
      currentView: "list",
      setCurrentView: (view) => set({ currentView: view }),

      // ==================== MODALS ====================
      isAddEventModalOpen: false,
      openAddEventModal: () => set({ isAddEventModalOpen: true }),
      closeAddEventModal: () => set({ 
        isAddEventModalOpen: false,
        eventPrefillData: null,
      }),

      isEditEventModalOpen: false,
      selectedEventIdForEdit: null,
      openEditEventModal: (eventId) => set({ 
        isEditEventModalOpen: true,
        selectedEventIdForEdit: eventId,
      }),
      closeEditEventModal: () => set({ 
        isEditEventModalOpen: false,
        selectedEventIdForEdit: null,
      }),

      isAddTaskModalOpen: false,
      openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
      closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),

      isEditTaskModalOpen: false,
      selectedTaskIdForEdit: null,
      openEditTaskModal: (taskId) => set({ 
        isEditTaskModalOpen: true,
        selectedTaskIdForEdit: taskId,
      }),
      closeEditTaskModal: () => set({ 
        isEditTaskModalOpen: false,
        selectedTaskIdForEdit: null,
      }),

      isCustomizeModalOpen: false,
      openCustomizeModal: () => {
        set((state) => ({
          isCustomizeModalOpen: true,
          tempWidgets: [...state.visibleWidgets],
        }));
      },
      closeCustomizeModal: () => set({ isCustomizeModalOpen: false }),

      isSaveTemplateModalOpen: false,
      openSaveTemplateModal: () => set({ isSaveTemplateModalOpen: true }),
      closeSaveTemplateModal: () => set({ isSaveTemplateModalOpen: false }),

      isCreateFromTemplateModalOpen: false,
      openCreateFromTemplateModal: () => set({ isCreateFromTemplateModalOpen: true }),
      closeCreateFromTemplateModal: () => set({ isCreateFromTemplateModalOpen: false }),

      isEditProfileModalOpen: false,
      openEditProfileModal: () => {
        set((state) => ({
          isEditProfileModalOpen: true,
          tempProfileData: { ...state.profileData },
        }));
      },
      closeEditProfileModal: () => set({ isEditProfileModalOpen: false }),

      // ==================== TEMPLATE PREFILL DATA ====================
      eventPrefillData: null,
      setEventPrefillData: (data) => set({ eventPrefillData: data }),
      clearEventPrefillData: () => set({ eventPrefillData: null }),

      // ==================== TASK FILTERS ====================
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      sortBy: "date",
      setSortBy: (sort) => set({ sortBy: sort }),
      isFilterOpen: false,
      setIsFilterOpen: (open) => set({ isFilterOpen: open }),
      progressFilters: { notStarted: true, inProgress: true, completed: true },
      setProgressFilters: (filters) => set({ progressFilters: filters }),
      dateFilters: { past: true, thisWeek: true, thisMonth: true, upcoming: true },
      setDateFilters: (filters) => set({ dateFilters: filters }),

      // ==================== DASHBOARD WIDGETS ====================
      visibleWidgets: [...DEFAULT_WIDGETS],
      tempWidgets: [...DEFAULT_WIDGETS],
      
      setTempWidgets: (updater) =>
        set((state) => ({
          tempWidgets:
            typeof updater === "function"
              ? updater(state.tempWidgets)
              : updater,
        })),
      
      setVisibleWidgets: (widgets) => set({ visibleWidgets: widgets }),
      
      saveWidgetConfig: () =>
        set((state) => ({
          visibleWidgets: [...state.tempWidgets],
          isCustomizeModalOpen: false,
        })),
      
      resetWidgets: () =>
        set({
          visibleWidgets: [...DEFAULT_WIDGETS],
          tempWidgets: [...DEFAULT_WIDGETS],
        }),

      // ==================== SETTINGS ====================
      profileData: { ...DEFAULT_PROFILE_DATA },
      tempProfileData: { ...DEFAULT_PROFILE_DATA },
      
      setProfileData: (data) => set({ profileData: data }),
      
      setTempProfileData: (updater) =>
        set((state) => ({
          tempProfileData:
            typeof updater === "function"
              ? updater(state.tempProfileData)
              : updater,
        })),
      
      saveProfileData: () =>
        set((state) => ({
          profileData: { ...state.tempProfileData },
          isEditProfileModalOpen: false,
        })),
      
      resetTempProfileData: () =>
        set((state) => ({
          tempProfileData: { ...state.profileData },
          isEditProfileModalOpen: false,
        })),
      
      initializeProfileData: (username: string, email: string) => {
        const names = parseFullName(username);
        const data: ProfileData = {
          ...names,
          email,
          phone: "",
          location: "",
          bio: "",
        };
        set({
          profileData: data,
          tempProfileData: data,
        });
      },

      // Notification Settings
      notificationSettings: { email: true, inApp: true },
      setNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      // Appearance Settings
      appearanceSettings: { compactView: false },
      setAppearanceSettings: (settings) =>
        set((state) => ({
          appearanceSettings: { ...state.appearanceSettings, ...settings },
        })),

      // Privacy Settings
      privacySettings: { profileVisibility: true, activityTracking: true },
      setPrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),

      // ==================== LOADING & ERROR ====================
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // ==================== UTILITY ====================
      resetAllModals: () =>
        set({
          isAddEventModalOpen: false,
          isEditEventModalOpen: false,
          isAddTaskModalOpen: false,
          isEditTaskModalOpen: false,
          isCustomizeModalOpen: false,
          isSaveTemplateModalOpen: false,
          isCreateFromTemplateModalOpen: false,
          isEditProfileModalOpen: false,
          selectedEventIdForEdit: null,
          selectedTaskIdForEdit: null,
          eventPrefillData: null,
        }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        currentView: state.currentView,
        visibleWidgets: state.visibleWidgets,
        profileData: state.profileData,
        notificationSettings: state.notificationSettings,
        appearanceSettings: state.appearanceSettings,
        privacySettings: state.privacySettings,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        progressFilters: state.progressFilters,
        dateFilters: state.dateFilters,
      }),
    }
  )
);