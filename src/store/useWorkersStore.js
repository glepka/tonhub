import { create } from "zustand";
import { api } from "../utils/api.js";

export const useWorkersStore = create((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getWorkers();
      set({ workers: data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to load workers:", err);
    }
  },

  addWorker: async ({ name, role }) => {
    set({ loading: true, error: null });
    try {
      const worker = await api.createWorker({ name, role });
      set((state) => ({
        workers: [...state.workers, worker],
        loading: false,
      }));
      return { ok: true, worker };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to create worker:", err);
      return { ok: false, error: err.message };
    }
  },

  updateWorker: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const worker = await api.updateWorker(id, patch);
      set((state) => ({
        workers: state.workers.map((w) => (w.id === id ? worker : w)),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to update worker:", err);
      return { ok: false, error: err.message };
    }
  },

  removeWorker: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteWorker(id);
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to delete worker:", err);
      return { ok: false, error: err.message };
    }
  },
}));


