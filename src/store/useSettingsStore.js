import { create } from "zustand";
import { api } from "../utils/api.js";

export const useSettingsStore = create((set, get) => ({
  salaryPercent: 50,
  loading: false,
  error: null,

  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getSettings();
      set({ salaryPercent: data?.salaryPercent || 50, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to load settings:", err);
    }
  },

  setSalaryPercent: async (value) => {
    const percent = Number(value);
    const safe = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;

    set({ loading: true, error: null });
    try {
      const data = await api.updateSettings({ salaryPercent: safe });
      set({ salaryPercent: data?.salaryPercent || safe, loading: false });
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to update settings:", err);
      return { ok: false, error: err.message };
    }
  },
}));



