import { create } from "zustand";
import { api } from "../utils/api.js";

export const useBoxesStore = create((set, get) => ({
  boxes: [],
  loading: false,
  error: null,

  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getBoxes();
      set({ boxes: data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to load boxes:", err);
    }
  },

  addBox: async ({ number, description }) => {
    set({ loading: true, error: null });
    try {
      const box = await api.createBox({ number, description });
      set((state) => ({
        boxes: [...state.boxes, box],
        loading: false,
      }));
      return { ok: true, box };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to create box:", err);
      return { ok: false, error: err.message };
    }
  },

  updateBox: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const box = await api.updateBox(id, patch);
      set((state) => ({
        boxes: state.boxes.map((b) => (b.id === id ? box : b)),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to update box:", err);
      return { ok: false, error: err.message };
    }
  },

  removeBox: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteBox(id);
      set((state) => ({
        boxes: state.boxes.filter((b) => b.id !== id),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to delete box:", err);
      return { ok: false, error: err.message };
    }
  },
}));


