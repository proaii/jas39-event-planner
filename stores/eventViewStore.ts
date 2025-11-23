// /stores/eventViewStore.ts
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ViewType = 'list' | 'board';

interface EventViewStore {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const useEventViewStore = create<EventViewStore>()(
  devtools((set) => ({
    currentView: 'list',
    setView: (view) => set({ currentView: view }),
  }))
);
