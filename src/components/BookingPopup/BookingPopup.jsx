import React, { useEffect, useMemo } from "react";
import styles from "./BookingPopup.module.css";
import Button from "../Button/Button.jsx";
import { useBoxesStore } from "../../store/useBoxesStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useBookingsStore } from "../../store/useBookingsStore.js";

const BookingPopup = ({ booking, onClose }) => {
  if (!booking) return null;

  const start = new Date(booking.datetime);
  const dur = Number(booking.durationMinutes) || 60;
  const end = new Date(start.getTime() + dur * 60 * 1000);

  const boxes = useBoxesStore((s) => s.boxes);
  const workers = useWorkersStore((s) => s.workers);
  const updateBooking = useBookingsStore((s) => s.updateBooking);
  const bookingLive = useBookingsStore(
    (s) => s.bookings.find((b) => b.id === booking.id) || booking
  );

  const currentBox = useMemo(() => boxes.find((b) => b.id === bookingLive.boxId), [boxes, bookingLive.boxId]);
  const workersDisplay = useMemo(() => {
    const names = Array.isArray(bookingLive.workers) ? bookingLive.workers : [];
    return names.length ? names.join(", ") : "—";
  }, [bookingLive.workers]);

  const toggleWorker = (name) => {
    const current = Array.isArray(bookingLive.workers) ? bookingLive.workers : [];
    const isSelected = current.includes(name);
    const next = isSelected ? current.filter((n) => n !== name) : [...current, name];
    updateBooking(bookingLive.id, { workers: next });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.header}>
          <div className={styles.title}>Запись</div>
          <Button variant="ghost" onClick={onClose}>Закрыть</Button>
        </div>
        <div className={styles.body}>
          <div className={styles.row}>
            <span className={styles.label}>Клиент</span>
            <span className={styles.value}>{bookingLive.client}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Время</span>
            <span className={styles.value}>
              {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" "}—{" "}
              {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({dur} мин)
            </span>
          </div>
          <div className={styles.rowMulti}>
            <span className={styles.label}>Исполнители</span>
            <div className={styles.workers}>
              {workers.map((w) => {
                const isActive = (bookingLive.workers || []).includes(w.name);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`${styles.workerButton} ${isActive ? styles.workerSelected : ""}`}
                    onClick={() => toggleWorker(w.name)}
                  >
                    {w.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.label}></span>
            <span className={styles.value}>{workersDisplay}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Авто</span>
            <span className={styles.value}>{bookingLive.car}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Услуга</span>
            <span className={styles.value}>{bookingLive.service}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Бокс</span>
            <span className={styles.value}>
              {currentBox ? `№ ${currentBox.number}${currentBox.description ? ` — ${currentBox.description}` : ""}` : "—"}
            </span>
          </div>
          {bookingLive.note ? (
            <div className={styles.row}>
              <span className={styles.label}>Комментарий</span>
              <span className={styles.value}>{bookingLive.note}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookingPopup;


