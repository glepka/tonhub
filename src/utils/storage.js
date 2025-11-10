import { getSupabase } from "./supabase.js";

const local = {
  setItem: (k, v, cb) => {
    try {
      localStorage.setItem(k, v);
      cb?.(true);
    } catch {
      cb?.(false);
    }
  },
  getItem: (k, cb) => {
    try {
      cb?.(true, localStorage.getItem(k));
    } catch {
      cb?.(false, null);
    }
  },
};

export const persistToCloud = (key, data) => {
  const str = JSON.stringify(data);
  const supa = getSupabase();
  if (supa) {
    return supa
      .from("app_data")
      .upsert({ key, value: data, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (!error) return true;
        try {
          localStorage.setItem(key, str);
          return true;
        } catch {
          return false;
        }
      })
      .catch(() => {
        try {
          localStorage.setItem(key, str);
          return true;
        } catch {
          return false;
        }
      });
  }
  return new Promise((resolve) => {
    try {
      localStorage.setItem(key, str);
      resolve(true);
    } catch {
      resolve(false);
    }
  });
};

export const hydrateFromCloud = (key) => {
  const supa = getSupabase();
  if (supa) {
    return supa
      .from("app_data")
      .select("value")
      .eq("key", key)
      .single()
      .then(({ data, error }) => {
        if (!error && data && typeof data.value !== "undefined") {
          return data.value;
        }
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      });
  }
  return new Promise((resolve) => {
    try {
      const raw = localStorage.getItem(key);
      resolve(raw ? JSON.parse(raw) : null);
    } catch {
      resolve(null);
    }
  });
};


