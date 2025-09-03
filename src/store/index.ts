import { create } from "zustand";

interface AppState {
  userData: any;
  setUserData: (data: any) => void;
}

export const appStore = create<AppState>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
}));
