'use client';

import { create } from 'zustand';

interface ProfileModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useProfileModalStore = create<ProfileModalState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
