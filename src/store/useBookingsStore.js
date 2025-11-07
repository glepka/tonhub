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
  checkConflict: ({ datetime, durationMinutes, boxId, excludeId = null }) => {
    if (!boxId) return null;
    const start = new Date(datetime).getTime();
    if (!Number.isFinite(start)) return null;
    const dur = Number(durationMinutes) || 60;
    const end = start + dur * 60 * 1000;
    return get().bookings.find((b) => {
      if (b.boxId !== boxId) return false;
      if (excludeId && b.id === excludeId) return false;
      const bStart = new Date(b.datetime).getTime();
      const bDur = Number(b.durationMinutes) || 60;
      const bEnd = bStart + bDur * 60 * 1000;
      return start < bEnd && bStart < end;
    }) || null;
  },
  addBooking: ({ client, car, service, datetime, durationMinutes, price, workers, boxId, salaryPercent }) => {
    const conflict = get().checkConflict({ datetime, durationMinutes, boxId });
    if (conflict) {
      return { ok: false, conflict };
    }
    const id = crypto.randomUUID();
    const next = [
      ...get().bookings,
      { id, client, car, service, datetime, durationMinutes: Number(durationMinutes) || 60, price, workers, boxId, salaryPercent: Number(salaryPercent) || null },
    ];
    set({ bookings: next });
    persistToCloud("bookings", next);
    return { ok: true, id };
  },
  updateBooking: (id, patch) => {
    const current = get().bookings.find((b) => b.id === id);
    if (!current) return { ok: false };
    const nextDraft = { ...current, ...patch };
    const conflict = get().checkConflict({
      datetime: nextDraft.datetime,
      durationMinutes: nextDraft.durationMinutes,
      boxId: nextDraft.boxId,
      excludeId: id,
    });
    if (conflict) {
      return { ok: false, conflict };
    }
    const next = get().bookings.map((b) => (b.id === id ? nextDraft : b));
    set({ bookings: next });
    persistToCloud("bookings", next);
    return { ok: true };
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


