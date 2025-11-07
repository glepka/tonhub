import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Calendar.module.css";
import Button from "../Button/Button.jsx";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { formatDateKey, getWeekRange, getDayLabel } from "../../utils/date.js";

const Calendar = () => {
  const [mode, setMode] = useState("week"); // "day" | "week"
  const [cursor, setCursor] = useState(new Date());
  const bookings = useBookingsStore((s) => s.bookings);

  const days = useMemo(() => {
    if (mode === "day") return [cursor];
    return getWeekRange(cursor);
  }, [mode, cursor]);

  const itemsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      map[formatDateKey(d)] = [];
    });
    bookings.forEach((b) => {
      const key = formatDateKey(new Date(b.datetime));
      if (map[key]) map[key].push(b);
    });
    return map;
  }, [days, bookings]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.left}>
          <Button variant="ghost" onClick={() => setCursor(new Date())}>Сегодня</Button>
          <Button variant="ghost" onClick={() => setMode(mode === "week" ? "day" : "week")}>
            {mode === "week" ? "Режим: неделя" : "Режим: день"}
          </Button>
        </div>
        <div className={styles.right}>
          <Button variant="ghost" onClick={() => setCursor(new Date(cursor.getTime() - 24 * 3600 * 1000 * (mode === "week" ? 7 : 1)))}>
            ←
          </Button>
          <Button variant="ghost" onClick={() => setCursor(new Date(cursor.getTime() + 24 * 3600 * 1000 * (mode === "week" ? 7 : 1)))}>
            →
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${formatDateKey(cursor)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(220px, 1fr))` }}
        >
          {days.map((d) => {
            const key = formatDateKey(d);
            const list = itemsByDay[key] || [];
            return (
              <div key={key} className={styles.col}>
                <div className={styles.colHeader}>{getDayLabel(d)}</div>
                <div className={styles.colBody}>
                  {list.length === 0 ? (
                    <div className={styles.empty}>Нет записей</div>
                  ) : (
                    list.map((b) => (
                      <div key={b.id} className={styles.card}>
                        <div className={styles.rowTop}>
                          <span className={styles.client}>{b.client}</span>
                          <span className={styles.time}>{new Date(b.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className={styles.rowSub}>
                          <span className={styles.auto}>{b.car}</span>
                          <span className={styles.service}>{b.service}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Calendar;


