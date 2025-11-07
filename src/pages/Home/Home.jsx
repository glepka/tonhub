import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "../../components/Calendar/Calendar.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import styles from "./Home.module.css";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useBoxesStore } from "../../store/useBoxesStore.js";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const addBooking = useBookingsStore((s) => s.addBooking);
  const workers = useWorkersStore((s) => s.workers);
  const boxes = useBoxesStore((s) => s.boxes);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  useEffect(() => {
    if (open) {
      setSelectedWorkers([]);
      setSelectedDateTime(new Date());
    }
  }, [open]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selectedDateTime) {
      return;
    }
    const form = new FormData(e.currentTarget);
    const res = addBooking({
      client: form.get("client"),
      car: form.get("car"),
      service: form.get("service"),
      datetime: selectedDateTime.toISOString(),
      durationMinutes: Number(form.get("durationMinutes")) || 60,
      price: Number(form.get("price")) || 0,
      workers: selectedWorkers,
      boxId: form.get("boxId") || null,
    });
    if (res && res.ok === false) {
      setConflict(res.conflict);
      setConflictOpen(true);
      return;
    }
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
          <DatePicker
            selected={selectedDateTime}
            onChange={(date) => setSelectedDateTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd.MM.yyyy HH:mm"
            placeholderText="Выберите дату и время"
            className={styles.datePicker}
            wrapperClassName={styles.datePickerWrapper}
            required
          />
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
            {workers.map((w) => {
              const active = selectedWorkers.includes(w.name);
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`${styles.workerButton} ${active ? styles.workerSelected : ""}`}
                  onClick={() => {
                    setSelectedWorkers((prev) =>
                      prev.includes(w.name)
                        ? prev.filter((n) => n !== w.name)
                        : [...prev, w.name]
                    );
                  }}
                >
                  {w.name}
                </button>
              );
            })}
          </div>
          <Button type="submit">Создать</Button>
        </form>
      </Modal>

      {conflict && (
        <Modal
          open={conflictOpen}
          onClose={() => { setConflict(null); setConflictOpen(false); }}
          title="Время занято"
        >
          <div className={styles.conflictBody}>
            <p>В выбранном боксе уже есть запись на это время.</p>
            <p>
              Клиент: <strong>{conflict.client}</strong>
            </p>
            <p>
              Время: {new Date(conflict.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {new Date(new Date(conflict.datetime).getTime() + (Number(conflict.durationMinutes) || 60) * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p>
              Бокс: {(() => {
                const b = boxes.find((bx) => bx.id === conflict.boxId);
                return b ? `№ ${b.number}` : "—";
              })()}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Home;


