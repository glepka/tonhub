import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Calendar.module.css";
import Button from "../Button/Button.jsx";
import BookingPopup from "../BookingPopup/BookingPopup.jsx";
import { useBookingsStore } from "../../store/useBookingsStore.js";
import { useBoxesStore } from "../../store/useBoxesStore.js";
import { formatDateKey, getWeekRange, getDayLabel } from "../../utils/date.js";

const Calendar = () => {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const bookings = useBookingsStore((s) => s.bookings);
  const boxes = useBoxesStore((s) => s.boxes);
  const headerRef = useRef(null);
  const timelineInnerRef = useRef(null);
  const daysRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);
  const shouldScrollRef = useRef(false);
  const prevSelectedRef = useRef(selected);

  const scrollSelectedDayIntoCenter = () => {
    const container = daysRef.current;
    if (!container) return;
    const selectedEl = container.querySelector(`.${styles.daySelected}`);
    if (!selectedEl) return;
    const containerRect = container.getBoundingClientRect();
    const selectedRect = selectedEl.getBoundingClientRect();
    const elementCenter =
      selectedRect.left -
      containerRect.left +
      container.scrollLeft +
      selectedRect.width / 2;
    const target = elementCenter - container.clientWidth / 2;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const next = Math.max(0, Math.min(maxScroll, target));
    container.scrollTo({ left: next, behavior: "smooth" });
  };

  const onPickDate = (date) => {
    if (!date) return;
    shouldScrollRef.current = true;
    setCursor(date);
    setSelected(date);
  };

  const days = useMemo(() => getWeekRange(selected), [selected]);

  const selectedKey = useMemo(() => formatDateKey(selected), [selected]);
  const dayBookings = useMemo(() => {
    const key = selectedKey;
    return bookings.filter((b) => formatDateKey(new Date(b.datetime)) === key);
  }, [bookings, selectedKey]);

  const HOURS_START = 10;
  const HOURS_END = 22;
  const HOUR_PX = 60;
  const totalMinutes = (HOURS_END - HOURS_START) * 60;

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight || 0);
    }
    if (headerRef.current && timelineInnerRef.current) {
      const innerTop = timelineInnerRef.current.getBoundingClientRect().top;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setHeaderOffset(Math.max(0, Math.round(headerBottom - innerTop)));
    }
  }, [boxes.length, selected]);

  // Auto-scroll days row to keep selected day centered
  // This handles cases when selected day is in the same week or when clicking on a day directly
  useEffect(() => {
    const selectedChanged = formatDateKey(prevSelectedRef.current) !== formatDateKey(selected);
    prevSelectedRef.current = selected;
    
    // If selected changed and scroll is requested, wait for animation to complete (180ms + buffer)
    if (selectedChanged && shouldScrollRef.current) {
      shouldScrollRef.current = false;
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollSelectedDayIntoCenter();
          });
        });
      }, 200); // 180ms animation + 20ms buffer
      return () => clearTimeout(timeoutId);
    }
    
    // If scroll was requested but selected didn't change, scroll immediately
    if (shouldScrollRef.current) {
      shouldScrollRef.current = false;
    }
    
    const container = daysRef.current;
    if (!container) return;
    const selectedEl = container.querySelector(`.${styles.daySelected}`);
    if (!selectedEl) return;
    // Ensure layout is ready
    const rAF = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      const elementCenter =
        selectedRect.left -
        containerRect.left +
        container.scrollLeft +
        selectedRect.width / 2;
      const target = elementCenter - container.clientWidth / 2;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const next = Math.max(0, Math.min(maxScroll, target));
      container.scrollTo({ left: next, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(rAF);
  }, [selected, days.length]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <Button
            variant="ghost"
            className={styles.navGrow}
            onClick={() => {
              const d = new Date(selected.getTime() - 24 * 3600 * 1000);
              shouldScrollRef.current = true;
              setCursor(d);
              setSelected(d);
            }}
          >
            ←
          </Button>
          <Button
            variant="ghost"
            className={styles.navGrow}
            onClick={() => {
              const d = new Date(selected.getTime() + 24 * 3600 * 1000);
              shouldScrollRef.current = true;
              setCursor(d);
              setSelected(d);
            }}
          >
            →
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const now = new Date();
              shouldScrollRef.current = true;
              setCursor(now);
              setSelected(now);
            }}
          >
            Сегодня
          </Button>
        </div>
        <DatePicker
          selected={selected}
          onChange={onPickDate}
          dateFormat="dd.MM.yyyy"
          className={styles.datePicker}
          wrapperClassName={styles.datePickerWrapper}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`days-${formatDateKey(selected)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={styles.days}
          ref={daysRef}
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(140px, 1fr))`,
          }}
        >
          {days.map((d) => {
            const key = formatDateKey(d);
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                className={`${styles.day} ${
                  isSelected ? styles.daySelected : ""
                }`}
                onClick={() => setSelected(d)}
              >
                {getDayLabel(d)}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className={styles.timeline}>
        <div
          ref={timelineInnerRef}
          className={styles.timelineInner}
          style={{
            "--headerHeight": `${headerHeight}px`,
            "--headerOffset": `${headerOffset}px`,
          }}
        >
          <div className={styles.timeAxis} style={{ top: headerOffset }}>
            {new Array(HOURS_END - HOURS_START + 1).fill(0).map((_, i) => {
              const h = HOURS_START + i;
              return (
                <div
                  key={h}
                  className={styles.timeTick}
                  style={{ top: `${i * HOUR_PX}px` }}
                >
                  <span className={styles.timeLabel}>{`${String(h).padStart(
                    2,
                    "0"
                  )}:00`}</span>
                </div>
              );
            })}
          </div>
          <div
            className={styles.lanes}
            style={{ gridTemplateColumns: `repeat(${boxes.length}, 220px)` }}
          >
            {boxes.map((box, idx) => (
              <div key={box.id} className={styles.lane}>
                <div
                  className={styles.laneHeader}
                  ref={idx === 0 ? headerRef : null}
                >
                  {box.number}
                </div>
                <div className={styles.laneBody}>
                  {dayBookings
                    .filter((b) => b.boxId === box.id)
                    .map((b) => {
                      const start = new Date(b.datetime);
                      const minutes =
                        start.getHours() * 60 + start.getMinutes();
                      const rangeStart = HOURS_START * 60;
                      const rangeEnd = HOURS_END * 60;
                      const dur = Number(b.durationMinutes) || 60;
                      const eventStart = Math.max(minutes, rangeStart);
                      const eventEnd = Math.min(minutes + dur, rangeEnd);
                      if (eventEnd <= rangeStart || eventStart >= rangeEnd)
                        return null;
                      const top = ((eventStart - rangeStart) / 60) * HOUR_PX;
                      const height = Math.max(
                        18,
                        ((eventEnd - eventStart) / 60) * HOUR_PX
                      );
                      return (
                        <div
                          key={b.id}
                          className={styles.event}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={() => setActiveBooking(b)}
                        >
                          <div className={styles.rowTop}>
                            <span className={styles.client}>{b.client}</span>
                            <span className={styles.time}>
                              {start.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className={styles.rowSub}>
                            <span className={styles.auto}>{b.car}</span>
                            <span className={styles.service}>{b.service}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeBooking && (
        <BookingPopup
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
        />
      )}
    </div>
  );
};

export default Calendar;
