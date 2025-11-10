import { create } from "zustand";
import { api } from "../utils/api.js";

const isValidDate = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime());
};

const normalizeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const validate = (payload) => {
  const title = (payload?.title || "").trim();
  if (!title) return { ok: false, error: "Название услуги обязательно" };
  const price = normalizeNumber(payload?.price);
  if (price < 0) return { ok: false, error: "Цена не может быть отрицательной" };
  const percent = normalizeNumber(payload?.percent);
  if (percent < 0 || percent > 100) return { ok: false, error: "Процент должен быть 0–100" };
  const dateISO = payload?.dateISO;
  if (!isValidDate(dateISO)) return { ok: false, error: "Некорректная дата" };
  const workerIds = Array.isArray(payload?.workerIds) ? payload.workerIds.filter(Boolean) : [];
  if (workerIds.length < 1) return { ok: false, error: "Выберите хотя бы одного работника" };
  return { ok: true, normalized: { title, price, percent, dateISO, workerIds } };
};

export const useServicesStore = create((set, get) => ({
  services: [],
  lastError: null,
  loading: false,

  hydrate: async () => {
    set({ loading: true, lastError: null });
    try {
      const data = await api.getServices();
      set({ services: data || [], loading: false });
    } catch (err) {
      set({ lastError: err.message, loading: false });
      console.error("Failed to load services:", err);
    }
  },

  addService: async (payload) => {
    const v = validate(payload || {});
    if (!v.ok) {
      set({ lastError: v.error });
      return { ok: false, error: v.error };
    }

    set({ loading: true, lastError: null });
    try {
      const service = await api.createService(v.normalized);
      set((state) => ({
        services: [...state.services, service],
        lastError: null,
        loading: false,
      }));
      return { ok: true, service };
    } catch (err) {
      const errorMsg = err.message || "Ошибка при создании услуги";
      set({ lastError: errorMsg, loading: false });
      console.error("Failed to create service:", err);
      return { ok: false, error: errorMsg };
    }
  },

  updateService: async (id, patch) => {
    const current = get().services.find((s) => s.id === id);
    if (!current) return { ok: false, error: "Услуга не найдена" };

    const v = validate({ ...current, ...patch });
    if (!v.ok) {
      set({ lastError: v.error });
      return { ok: false, error: v.error };
    }

    set({ loading: true, lastError: null });
    try {
      const service = await api.updateService(id, v.normalized);
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? service : s)),
        lastError: null,
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      const errorMsg = err.message || "Ошибка при обновлении услуги";
      set({ lastError: errorMsg, loading: false });
      console.error("Failed to update service:", err);
      return { ok: false, error: errorMsg };
    }
  },

  removeService: async (id) => {
    set({ loading: true, lastError: null });
    try {
      await api.deleteService(id);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        loading: false,
      }));
      return { ok: true };
    } catch (err) {
      const errorMsg = err.message || "Ошибка при удалении услуги";
      set({ lastError: errorMsg, loading: false });
      console.error("Failed to delete service:", err);
      return { ok: false, error: errorMsg };
    }
  },
}));


