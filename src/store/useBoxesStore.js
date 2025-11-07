import { create } from "zustand";
import { persistToCloud, hydrateFromCloud } from "../utils/storage.js";

export const useBoxesStore = create((set, get) => ({
  boxes: [
    { id: "b1", number: "1", description: "Премиум зона" },
    { id: "b2", number: "2", description: "Стандарт" },
  ],
  addBox: ({ number, description }) => {
    const id = crypto.randomUUID();
    const next = [...get().boxes, { id, number, description }];
    set({ boxes: next });
    persistToCloud("boxes", next);
  },
  updateBox: (id, patch) => {
    const next = get().boxes.map((b) => (b.id === id ? { ...b, ...patch } : b));
    set({ boxes: next });
    persistToCloud("boxes", next);
  },
  removeBox: (id) => {
    const next = get().boxes.filter((b) => b.id !== id);
    set({ boxes: next });
    persistToCloud("boxes", next);
  },
  hydrate: async () => {
    const data = await hydrateFromCloud("boxes");
    if (data) set({ boxes: data });
  },
}));


