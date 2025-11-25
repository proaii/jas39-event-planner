'use client';

import { create } from 'zustand';

interface EventDetailState {
  // UI State
  showDeleteDialog: boolean;
  sortBy: 'dueDate' | 'priority' | 'status' | 'name';
  expandedTaskId: string | null;
  showCoverImage: boolean;

  // Actions
  setShowDeleteDialog: (show: boolean) => void;
  setSortBy: (sortBy: 'dueDate' | 'priority' | 'status' | 'name') => void;
  setExpandedTaskId: (taskId: string | null) => void;
  toggleTaskExpansion: (taskId: string) => void;
  setShowCoverImage: (show: boolean) => void;
  
  // Reset
  resetEventDetailState: () => void;
}

const initialState = {
  showDeleteDialog: false,
  sortBy: 'dueDate' as const,
  expandedTaskId: null,
  showCoverImage: true,
};

export const useEventDetailStore = create<EventDetailState>((set, get) => ({
  ...initialState,

  setShowDeleteDialog: (show) => set({ showDeleteDialog: show }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setExpandedTaskId: (taskId) => set({ expandedTaskId: taskId }),
  
  toggleTaskExpansion: (taskId) => {
    const current = get().expandedTaskId;
    set({ expandedTaskId: current === taskId ? null : taskId });
  },
  
  setShowCoverImage: (show) => set({ showCoverImage: show }),
  
  resetEventDetailState: () => set(initialState),
}));