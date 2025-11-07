import { create } from "zustand";
import { persistToCloud, hydrateFromCloud } from "../utils/storage.js";

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

  hydrate: async () => {
    const data = await hydrateFromCloud("services");
    if (data) set({ services: data });
  },

  addService: (payload) => {
    const v = validate(payload || {});
    if (!v.ok) {
      set({ lastError: v.error });
      return { ok: false, error: v.error };
    }
    const service = { id: crypto.randomUUID(), ...v.normalized };
    const next = [...get().services, service];
    set({ services: next, lastError: null });
    persistToCloud("services", next);
    return { ok: true, service };
  },

  updateService: (id, patch) => {
    const current = get().services.find((s) => s.id === id);
    if (!current) return { ok: false, error: "Услуга не найдена" };
    const v = validate({ ...current, ...patch });
    if (!v.ok) {
      set({ lastError: v.error });
      return { ok: false, error: v.error };
    }
    const next = get().services.map((s) => (s.id === id ? { ...s, ...v.normalized } : s));
    set({ services: next, lastError: null });
    persistToCloud("services", next);
    return { ok: true };
  },

  removeService: (id) => {
    const next = get().services.filter((s) => s.id !== id);
    set({ services: next });
    persistToCloud("services", next);
  },
}));


