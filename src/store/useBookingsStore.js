import { create } from "zustand";
import { persistToCloud, hydrateFromCloud } from "../utils/storage.js";

export const useBookingsStore = create((set, get) => ({
  bookings: [
    {
      id: "bk1",
      client: "Иван",
      car: "BMW 5",
      service: "Полировка",
      datetime: new Date().toISOString(),
      durationMinutes: 60,
      price: 8000,
      workers: ["Антон"],
      boxId: "b1",
      salaryPercent: null,
    },
  ],
  addBooking: ({ client, car, service, datetime, durationMinutes, price, workers, boxId, salaryPercent }) => {
    const id = crypto.randomUUID();
    const next = [
      ...get().bookings,
      { id, client, car, service, datetime, durationMinutes: Number(durationMinutes) || 60, price, workers, boxId, salaryPercent: Number(salaryPercent) || null },
    ];
    set({ bookings: next });
    persistToCloud("bookings", next);
  },
  updateBooking: (id, patch) => {
    const next = get().bookings.map((b) => (b.id === id ? { ...b, ...patch } : b));
    set({ bookings: next });
    persistToCloud("bookings", next);
  },
  removeBooking: (id) => {
    const next = get().bookings.filter((b) => b.id !== id);
    set({ bookings: next });
    persistToCloud("bookings", next);
  },
  hydrate: async () => {
    const data = await hydrateFromCloud("bookings");
    if (data) set({ bookings: data });
  },
}));


