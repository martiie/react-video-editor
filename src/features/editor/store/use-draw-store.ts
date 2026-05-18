import { create } from "zustand";

export interface DrawSettings {
  color: string;
  strokeWidth: number;
  opacity: number; // 0–1
  animationMode: "sequential" | "parallel";
  easing: string;
}

interface IDrawStore {
  isDrawing: boolean;
  activeDrawItemId: string | null;
  settings: DrawSettings;
  setIsDrawing: (v: boolean) => void;
  setActiveDrawItemId: (id: string | null) => void;
  updateSettings: (patch: Partial<DrawSettings>) => void;
}

const useDrawStore = create<IDrawStore>((set) => ({
  isDrawing: false,
  activeDrawItemId: null,
  settings: {
    color: "#FF3B30",
    strokeWidth: 8,
    opacity: 1,
    animationMode: "sequential",
    easing: "easeOut"
  },
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setActiveDrawItemId: (activeDrawItemId) => set({ activeDrawItemId }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } }))
}));

export default useDrawStore;
