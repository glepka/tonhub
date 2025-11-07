import { create } from "zustand";
import { persistToCloud, hydrateFromCloud } from "../utils/storage.js";

export const useWorkersStore = create((set, get) => ({
  workers: [
    { id: "w1", name: "Антон", role: "Полировщик" },
    { id: "w2", name: "Мария", role: "Мойщик" },
  ],
  addWorker: ({ name, role }) => {
    const id = crypto.randomUUID();
    const next = [...get().workers, { id, name, role }];
    set({ workers: next });
    persistToCloud("workers", next);
  },
  updateWorker: (id, patch) => {
    const next = get().workers.map((w) => (w.id === id ? { ...w, ...patch } : w));
    set({ workers: next });
    persistToCloud("workers", next);
  },
  removeWorker: (id) => {
    const next = get().workers.filter((w) => w.id !== id);
    set({ workers: next });
    persistToCloud("workers", next);
  },
  hydrate: async () => {
    const data = await hydrateFromCloud("workers");
    if (data) set({ workers: data });
  },
}));


