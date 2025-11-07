import React, { useState } from "react";
import Calendar from "../../components/Calendar/Calendar.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import styles from "./Home.module.css";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useBoxesStore } from "../../store/useBoxesStore.js";

const Home = () => {
  const [open, setOpen] = useState(false);
  const addBooking = useBookingsStore((s) => s.addBooking);
  const workers = useWorkersStore((s) => s.workers);
  const boxes = useBoxesStore((s) => s.boxes);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addBooking({
      client: form.get("client"),
      car: form.get("car"),
      service: form.get("service"),
      datetime: form.get("datetime"),
      durationMinutes: Number(form.get("durationMinutes")) || 60,
      price: Number(form.get("price")) || 0,
      workers: form.getAll("workers"),
      boxId: form.get("boxId") || null,
    });
    setOpen(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1 className={styles.title}>Календарь</h1>
        <Button onClick={() => setOpen(true)}>Добавить запись</Button>
      </div>
      <Calendar />

      <Modal open={open} onClose={() => setOpen(false)} title="Новая запись">
        <form className={styles.form} onSubmit={onSubmit}>
          <input name="client" required placeholder="Имя клиента" />
          <input name="car" required placeholder="Автомобиль" />
          <input name="service" required placeholder="Услуга" />
          <input name="datetime" required type="datetime-local" />
          <input name="durationMinutes" type="number" min="5" step="5" placeholder="Длительность, мин" />
          <input name="price" type="number" min="0" step="100" placeholder="Цена, ₽" />
          <select name="boxId" defaultValue="">
            <option value="">Без бокса</option>
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>{b.number}</option>
            ))}
          </select>
          <label className={styles.label}>Выберите работников</label>
          <div className={styles.workers}>
            {workers.map((w) => (
              <label key={w.id} className={styles.workerOpt}>
                <input type="checkbox" name="workers" value={w.name} />
                <span>{w.name}</span>
              </label>
            ))}
          </div>
          <Button type="submit">Создать</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Home;


