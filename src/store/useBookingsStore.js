import { create } from "zustand";
import { api } from "../utils/api.js";

export const useBookingsStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  hydrate: async (date) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getBookings(date);
      set({ bookings: data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to load bookings:", err);
    }
  },

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

  addBooking: async ({ client, car, service, datetime, durationMinutes, price, workers, boxId, salaryPercent }) => {
    set({ loading: true, error: null });
    try {
      const booking = await api.createBooking({
        client,
        car,
        service,
        datetime,
        durationMinutes,
        price,
        workers,
        boxId,
        salaryPercent,
      });
      set((state) => ({
        bookings: [...state.bookings, booking],
        loading: false,
      }));
      return { ok: true, booking };
    } catch (err) {
      const errorMsg = err.message || "Ошибка при создании бронирования";
      set({ error: errorMsg, loading: false });
      console.error("Failed to create booking:", err);

      // Check if it's a conflict error (409 status)
      if (err.status === 409 && err.data?.conflict) {
        return { ok: false, conflict: err.data.conflict, error: "Обнаружен конфликт времени" };
      }

      return { ok: false, error: errorMsg };
    }
  },

  updateBooking: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const booking = await api.updateBooking(id, patch);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      const errorMsg = err.message || "Ошибка при обновлении бронирования";
      set({ error: errorMsg, loading: false });
      console.error("Failed to update booking:", err);

      // Check if it's a conflict error (409 status)
      if (err.status === 409 && err.data?.conflict) {
        return { ok: false, conflict: err.data.conflict, error: "Обнаружен конфликт времени" };
      }

      return { ok: false, error: errorMsg };
    }
  },

  removeBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteBooking(id);
      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to delete booking:", err);
      return { ok: false, error: err.message };
    }
  },
}));


