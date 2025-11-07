import { useMemo, useState, useCallback } from "react";
import styles from "./PeriodSalary.module.css";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useServicesStore } from "../../store/useServicesStore.js";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useSettingsStore } from "../../store/useSettingsStore.js";
import {
  aggregateSalariesByWorker,
  formatCurrency,
  isWithinPeriod,
} from "../../utils/salary.js";

const PeriodSalary = () => {
  const workers = useWorkersStore((s) => s.workers);
  const services = useServicesStore((s) => s.services);
  const bookings = useBookingsStore((s) => s.bookings);
  const settingsPercent = useSettingsStore((s) => s.salaryPercent);

  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const first = new Date(year, monthIndex, 1);
    const last = new Date(year, monthIndex + 1, 0);
    const fmt = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    return { from: fmt(first), to: fmt(last) };
  };
  const { from: defaultFrom, to: defaultTo } = getCurrentMonthRange();
  const [fromISO, setFromISO] = useState(defaultFrom);
  const [toISO, setToISO] = useState(defaultTo);

  const totalsFromServices = useMemo(
    () => aggregateSalariesByWorker(services, fromISO || null, toISO || null),
    [services, fromISO, toISO]
  );

  const nameToId = useMemo(
    () =>
      workers.reduce((acc, w) => {
        acc[w.name] = w.id;
        return acc;
      }, {}),
    [workers]
  );

  const totalsFromBookings = useMemo(() => {
    const res = {};
    (bookings || []).forEach((b) => {
      if (!isWithinPeriod(b?.datetime, fromISO || null, toISO || null)) return;
      const names = Array.isArray(b.workers) ? b.workers : [];
      const count = names.length || 0;
      if (count === 0) return;
      const effectivePercent =
        typeof b.salaryPercent === "number" ? b.salaryPercent : settingsPercent;
      const base =
        ((Number(b.price) || 0) * (Number(effectivePercent) || 0)) / 100;
      const part = Math.round((base / count) * 100) / 100;
      names.forEach((name) => {
        const wid = nameToId[name];
        if (!wid) return;
        res[wid] = (res[wid] || 0) + part;
      });
    });
    return res;
  }, [bookings, fromISO, toISO, nameToId, settingsPercent]);

  const totals = useMemo(() => {
    const out = { ...totalsFromServices };
    Object.keys(totalsFromBookings).forEach((wid) => {
      out[wid] = (out[wid] || 0) + totalsFromBookings[wid];
    });
    return out;
  }, [totalsFromServices, totalsFromBookings]);

  const workerMap = useMemo(
    () =>
      workers.reduce((acc, w) => {
        acc[w.id] = w;
        return acc;
      }, {}),
    [workers]
  );
  const onFromChange = useCallback((e) => setFromISO(e.target.value), []);
  const onToChange = useCallback((e) => setToISO(e.target.value), []);

  const rows = useMemo(
    () =>
      Object.keys(totals)
        .map((wid) => ({
          id: wid,
          name: workerMap[wid]?.name || wid,
          amount: totals[wid],
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [totals, workerMap]
  );

  const totalSum = useMemo(
    () => rows.reduce((acc, r) => acc + (r.amount || 0), 0),
    [rows]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <label className={styles.label}>
          От
          <input
            type="date"
            value={fromISO}
            onChange={onFromChange}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          До
          <input
            type="date"
            value={toISO}
            onChange={onToChange}
            className={styles.input}
          />
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Работник</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{formatCurrency(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Итого</td>
            <td>{formatCurrency(totalSum)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PeriodSalary;
