import { useMemo, useState, useCallback } from "react";
import styles from "./ServiceForm.module.css";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useServicesStore } from "../../store/useServicesStore.js";

const initialState = { title: "", price: "", percent: "", dateISO: "", workerIds: [] };
const numberOrEmpty = (v) => (v === "" ? "" : String(v));

const ServiceForm = ({ onCreated }) => {
  const workers = useWorkersStore((s) => s.workers);
  const addService = useServicesStore((s) => s.addService);
  const lastError = useServicesStore((s) => s.lastError);

  const [form, setForm] = useState(initialState);
  const [localError, setLocalError] = useState(null);

  const canSubmit = useMemo(() => {
    const titleOk = form.title.trim().length > 0;
    const price = Number(form.price);
    const percent = Number(form.percent);
    const dateOk = Boolean(form.dateISO);
    const workersOk = Array.isArray(form.workerIds) && form.workerIds.length > 0;
    return (
      titleOk && Number.isFinite(price) && price >= 0 && Number.isFinite(percent) && percent >= 0 && percent <= 100 && dateOk && workersOk
    );
  }, [form]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setLocalError(null);
  }, []);

  const onNumberChange = useCallback((e) => {
    const { name, value } = e.target;
    const num = value === "" ? "" : Number(value);
    if (value === "" || Number.isFinite(num)) {
      setForm((f) => ({ ...f, [name]: value }));
      setLocalError(null);
    }
  }, []);

  const onWorkersChange = useCallback((e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, workerIds: options }));
    setLocalError(null);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!canSubmit) return;
      const payload = {
        title: form.title.trim(),
        price: Number(form.price),
        percent: Number(form.percent),
        dateISO: form.dateISO,
        workerIds: form.workerIds,
      };
      const res = addService(payload);
      if (!res?.ok) {
        setLocalError(res?.error || "Ошибка сохранения");
        return;
      }
      setForm(initialState);
      if (onCreated) onCreated(res.service);
    },
    [canSubmit, form, addService, onCreated]
  );

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <label className={styles.label}>
          Название
          <input name="title" value={form.title} onChange={onChange} className={styles.input} placeholder="Услуга" />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Цена
          <input name="price" value={numberOrEmpty(form.price)} onChange={onNumberChange} type="number" min="0" step="0.01" className={styles.input} placeholder="0" />
        </label>
        <label className={styles.label}>
          Процент
          <input name="percent" value={numberOrEmpty(form.percent)} onChange={onNumberChange} type="number" min="0" max="100" step="0.01" className={styles.input} placeholder="0" />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Дата
          <input name="dateISO" value={form.dateISO} onChange={onChange} type="date" className={styles.input} />
        </label>
        <label className={styles.label}>
          Работники
          <select multiple value={form.workerIds} onChange={onWorkersChange} className={styles.select}>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(localError || lastError) && <div className={styles.error}>{localError || lastError}</div>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          Сохранить услугу
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;


