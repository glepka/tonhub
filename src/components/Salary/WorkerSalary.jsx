import { useMemo, useState, useCallback } from "react";
import styles from "./WorkerSalary.module.css";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useServicesStore } from "../../store/useServicesStore.js";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useSettingsStore } from "../../store/useSettingsStore.js";
import { calculateServiceSplit, isWithinPeriod, formatCurrency } from "../../utils/salary.js";

const WorkerSalary = () => {
  const workers = useWorkersStore((s) => s.workers);
  const services = useServicesStore((s) => s.services);
  const bookings = useBookingsStore((s) => s.bookings);
  const settingsPercent = useSettingsStore((s) => s.salaryPercent);

  const [workerId, setWorkerId] = useState("");
  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const [fromISO, setFromISO] = useState(getTodayISO());
  const [toISO, setToISO] = useState(getTodayISO());

  const onWorkerChange = useCallback((e) => setWorkerId(e.target.value), []);
  const onFromChange = useCallback((e) => setFromISO(e.target.value), []);
  const onToChange = useCallback((e) => setToISO(e.target.value), []);

  const filteredServices = useMemo(() => {
    return (services || []).filter((s) => isWithinPeriod(s?.dateISO, fromISO || null, toISO || null));
  }, [services, fromISO, toISO]);

  const filteredBookings = useMemo(() => {
    return (bookings || []).filter((b) => isWithinPeriod(b?.datetime, fromISO || null, toISO || null));
  }, [bookings, fromISO, toISO]);

  const rows = useMemo(() => {
    if (!workerId) return [];

    const serviceRows = filteredServices
      .map((s) => {
        const split = calculateServiceSplit(s);
        const payout = split[workerId] || 0;
        return payout > 0
          ? {
              id: `svc_${s.id}`,
              title: s.title,
              dateISO: s.dateISO,
              price: s.price,
              percent: s.percent,
              payout,
            }
          : null;
      })
      .filter(Boolean);

    const selectedWorker = workers.find((w) => w.id === workerId);
    const selectedName = selectedWorker?.name || "";

    const bookingRows = filteredBookings
      .map((b) => {
        const names = Array.isArray(b.workers) ? b.workers : [];
        const count = names.length || 0;
        if (!selectedName || count === 0) return null;
        if (!names.includes(selectedName)) return null;
        const effectivePercent = typeof b.salaryPercent === "number" ? b.salaryPercent : settingsPercent;
        const base = (Number(b.price) || 0) * (Number(effectivePercent) || 0) / 100;
        const payout = Math.round((base / count) * 100) / 100;
        const dateOnly = (() => {
          try {
            const d = new Date(b.datetime);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          } catch {
            return "";
          }
        })();
        return payout > 0
          ? {
              id: `bk_${b.id}`,
              title: b.service,
              dateISO: dateOnly,
              price: b.price,
              percent: effectivePercent,
              payout,
            }
          : null;
      })
      .filter(Boolean);

    return [...serviceRows, ...bookingRows].sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));
  }, [filteredServices, filteredBookings, workerId, workers, settingsPercent]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + (r.payout || 0), 0), [rows]);

  const count = rows.length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <label className={styles.label}>
          Работник
          <select value={workerId} onChange={onWorkerChange} className={styles.select}>
            <option value="">Выберите работника</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          От
          <input type="date" value={fromISO} onChange={onFromChange} className={styles.input} />
        </label>
        <label className={styles.label}>
          До
          <input type="date" value={toISO} onChange={onToChange} className={styles.input} />
        </label>
      </div>

      <div className={styles.summary}> 
        <div className={styles.summaryItem}>Услуг: <strong>{count}</strong></div>
        <div className={styles.summaryItem}>Итого: <strong>{formatCurrency(total)}</strong></div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Услуга</th>
            <th>Начисление</th>
            <th>Цена</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.dateISO}</td>
              <td>{r.title}</td>
              <td>{formatCurrency(r.payout)}</td>
              <td>{formatCurrency(r.price)}</td>
              <td>{r.percent}</td>
            </tr>
          ))}
          {workerId && rows.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.empty}>Нет услуг за выбранный период</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerSalary;



