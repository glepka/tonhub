import React, { useState } from "react";
import styles from "./Bookings.module.css";
import BookingCard from "../../components/BookingCard/BookingCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useBoxesStore } from "../../store/useBoxesStore.js";
import { useSettingsStore } from "../../store/useSettingsStore.js";

const Bookings = () => {
  const { bookings, addBooking, updateBooking, removeBooking } = useBookingsStore();
  const workers = useWorkersStore((s) => s.workers);
  const boxes = useBoxesStore((s) => s.boxes);
  const defaultSalaryPercent = useSettingsStore((s) => s.salaryPercent);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const toDatetimeLocal = (value) => {
    if (!value) return "";
    const d = new Date(value);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      client: form.get("client"),
      car: form.get("car"),
      service: form.get("service"),
      datetime: form.get("datetime"),
      durationMinutes: Number(form.get("durationMinutes")) || 60,
      price: Number(form.get("price")) || 0,
      workers: form.getAll("workers"),
      boxId: form.get("boxId") || null,
      salaryPercent: form.get("salaryPercent") ? Number(form.get("salaryPercent")) : null,
    };
    if (editing) {
      updateBooking(editing.id, payload);
    } else {
      addBooking(payload);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1 className={styles.title}>Записи</h1>
        <Button onClick={() => setOpen(true)}>Добавить</Button>
      </div>
      <div className={styles.list}>
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onEdit={(booking) => { setEditing(booking); setOpen(true); }}
            onDelete={removeBooking}
          />
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Редактировать запись" : "Новая запись"}>
        <form className={styles.form} onSubmit={onSubmit}>
          <input name="client" required placeholder="Имя клиента" defaultValue={editing?.client || ""} />
          <input name="car" required placeholder="Автомобиль" defaultValue={editing?.car || ""} />
          <input name="service" required placeholder="Услуга" defaultValue={editing?.service || ""} />
          <input name="datetime" required type="datetime-local" defaultValue={editing ? toDatetimeLocal(editing.datetime) : ""} />
          <input name="durationMinutes" type="number" min="5" step="5" placeholder="Длительность, мин" defaultValue={editing?.durationMinutes || ""} />
          <input name="price" type="number" min="0" step="100" placeholder="Цена, ₽" defaultValue={editing?.price || ""} />
          <select name="boxId" defaultValue={editing?.boxId || ""}>
            <option value="">Без бокса</option>
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>{b.number}</option>
            ))}
          </select>
          <input name="salaryPercent" type="number" min="0" max="100" step="1" placeholder={`Процент выплат, % (по умолчанию ${defaultSalaryPercent}%)`} defaultValue={typeof editing?.salaryPercent === "number" ? editing.salaryPercent : ""} />
          <label className={styles.label}>Выберите работников</label>
          <div className={styles.workers}>
            {workers.map((w) => (
              <label key={w.id} className={styles.workerOpt}>
                <input type="checkbox" name="workers" value={w.name} defaultChecked={editing?.workers?.includes(w.name)} />
                <span>{w.name}</span>
              </label>
            ))}
          </div>
          <Button type="submit">Сохранить</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Bookings;


