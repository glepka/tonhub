const cloud = () => window?.Telegram?.WebApp?.cloudStorage;

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
  const api = cloud() || local;
  return new Promise((resolve) => {
    api.setItem(key, str, (ok) => resolve(!!ok));
  });
};

export const hydrateFromCloud = (key) => {
  const api = cloud() || local;
  return new Promise((resolve) => {
    api.getItem(key, (ok, value) => {
      if (!ok || !value) return resolve(null);
      try {
        resolve(JSON.parse(value));
      } catch {
        resolve(null);
      }
    });
  });
};


