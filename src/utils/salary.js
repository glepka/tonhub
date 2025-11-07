const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    const intValue = Math.round(Number(value) || 0);
    return `${intValue} ₽`;
  }
};

const toDateOnly = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const isWithinPeriod = (dateISO, fromISO, toISO) => {
  const d = toDateOnly(dateISO);
  if (!d) return false;
  const f = fromISO ? toDateOnly(fromISO) : null;
  const t = toISO ? toDateOnly(toISO) : null;
  if (f && d < f) return false;
  if (t && d > t) return false;
  return true;
};

export const getServiceTotalSalary = (service) => {
  if (!service) return 0;
  const price = Number(service.price) || 0;
  const percent = Number(service.percent) || 0;
  if (percent < 0 || percent > 100) return 0;
  if (price < 0) return 0;
  return round2((price * percent) / 100);
};

export const calculateServiceSplit = (service) => {
  if (!service) return {};
  const { workerIds = [] } = service;
  const total = getServiceTotalSalary(service);
  const count = Array.isArray(workerIds) ? workerIds.length : 0;
  if (count <= 0 || total <= 0) return {};
  const part = total / count;
  return workerIds.reduce((acc, id) => {
    acc[id] = round2(part);
    return acc;
  }, {});
};

export const calculateWorkerSalaryForPeriod = (
  services,
  workerId,
  fromISO,
  toISO
) => {
  if (!Array.isArray(services) || !workerId) return 0;
  let sum = 0;
  for (const s of services) {
    if (!isWithinPeriod(s?.dateISO, fromISO, toISO)) continue;
    const split = calculateServiceSplit(s);
    if (split[workerId]) sum += split[workerId];
  }
  return round2(sum);
};

export const aggregateSalariesByWorker = (services, fromISO, toISO) => {
  const result = {};
  if (!Array.isArray(services)) return result;
  for (const s of services) {
    if (!isWithinPeriod(s?.dateISO, fromISO, toISO)) continue;
    const split = calculateServiceSplit(s);
    for (const wid of Object.keys(split)) {
      result[wid] = round2((result[wid] || 0) + split[wid]);
    }
  }
  return result;
};
