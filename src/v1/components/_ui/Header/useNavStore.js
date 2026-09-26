// stores/useNavStore.js
import { create } from "zustand";

export const useNavStore = create((set) => ({
  activePath: "/",
  setActivePath: (path) => set({ activePath: path }),
}));
