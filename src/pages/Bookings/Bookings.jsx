import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Bookings.module.css";
import BookingCard from "../../components/BookingCard/BookingCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useBoxesStore } from "../../store/useBoxesStore.js";
import { useSettingsStore } from "../../store/useSettingsStore.js";

const Bookings = () => {
  const { bookings, addBooking, updateBooking, removeBooking, hydrate } = useBookingsStore();
  const workers = useWorkersStore((s) => s.workers);
  const boxes = useBoxesStore((s) => s.boxes);
  const defaultSalaryPercent = useSettingsStore((s) => s.salaryPercent);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (open) {
      setSelectedWorkers(editing?.workers || []);
      setSelectedDateTime(editing?.datetime ? new Date(editing.datetime) : new Date());
    }
  }, [open, editing]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateTime) {
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = {
      client: form.get("client"),
      car: form.get("car"),
      service: form.get("service"),
      datetime: selectedDateTime.toISOString(),
      durationMinutes: Number(form.get("durationMinutes")) || 60,
      price: Number(form.get("price")) || 0,
      workers: selectedWorkers,
      boxId: form.get("boxId") || null,
      salaryPercent: form.get("salaryPercent") ? Number(form.get("salaryPercent")) : null,
    };
    if (editing) {
      const res = await updateBooking(editing.id, payload);
      if (res && res.ok === false) {
        setConflict(res.conflict);
        setConflictOpen(true);
        return;
      }
    } else {
      const res = await addBooking(payload);
      if (res && res.ok === false) {
        setConflict(res.conflict);
        setConflictOpen(true);
        return;
      }
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
          <Button type="submit">Сохранить</Button>
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

export default Bookings;


