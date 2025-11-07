import { create } from "zustand";
import { persistToCloud, hydrateFromCloud } from "../utils/storage.js";

export const useSettingsStore = create((set, get) => ({
  salaryPercent: 50,

  setSalaryPercent: (value) => {
    const percent = Number(value);
    const safe = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
    set({ salaryPercent: safe });
    persistToCloud("settings", { ...get(), salaryPercent: safe });
  },

  hydrate: async () => {
    const data = await hydrateFromCloud("settings");
    if (data && typeof data.salaryPercent === "number") {
      set({ salaryPercent: data.salaryPercent });
    }
  },
}));



