import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "./routes/index.js";
import Navigation from "./components/Navigation/Navigation.jsx";
import styles from "./styles/App.module.css";
import { initTelegram } from "./utils/telegram.js";
import { getSupabase } from "./utils/supabase.js";
import { useWorkersStore } from "./store/useWorkersStore.js";
import { useBoxesStore } from "./store/useBoxesStore.js";
import { useBookingsStore } from "./store/useBookingsStore.js";
import { useSettingsStore } from "./store/useSettingsStore.js";
import { useServicesStore } from "./store/useServicesStore.js";

const App = () => {
  useEffect(() => {
    initTelegram();
    // Disable vertical swipe gestures in Telegram Mini App
    window.Telegram?.WebApp?.disableVerticalSwipes?.();
    // hydrate state from Telegram Cloud or localStorage fallback
    useWorkersStore.getState().hydrate?.();
    useBoxesStore.getState().hydrate?.();
    useBookingsStore.getState().hydrate?.();
    useSettingsStore.getState().hydrate?.();
    useServicesStore.getState().hydrate?.();
  }, []);

  useEffect(() => {
    const setAppHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };
    setAppHeight();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);
    window.addEventListener("resize", setAppHeight);
    return () => {
      vv?.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      console.warn(
        "Supabase client not available, skipping realtime subscription"
      );
      return;
    }

    const channel = supa
      .channel("realtime:public:app_data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_data" },
        (payload) => {
          const record = payload?.new ?? payload?.old ?? null;
          const key = record?.key;
          const value = record?.value;
          if (!key) return;
          if (key === "workers" && Array.isArray(value)) {
            useWorkersStore.setState({ workers: value });
          } else if (key === "boxes" && Array.isArray(value)) {
            useBoxesStore.setState({ boxes: value });
          } else if (key === "bookings" && Array.isArray(value)) {
            useBookingsStore.setState({ bookings: value });
          } else if (key === "services" && Array.isArray(value)) {
            useServicesStore.setState({ services: value });
          } else if (key === "settings" && value && typeof value === "object") {
            const percent = Number(value.salaryPercent);
            useSettingsStore.setState({
              salaryPercent: Number.isFinite(percent) ? percent : 50,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to realtime channel");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Realtime channel error");
        } else if (status === "TIMED_OUT") {
          console.warn("Realtime subscription timed out");
        } else if (status === "CLOSED") {
          console.warn("Realtime channel closed");
        }
      });

    return () => {
      if (channel) {
        supa.removeChannel(channel).catch((error) => {
          console.error("Error removing channel:", error);
        });
      }
    };
  }, []);

  return (
    <div className={styles.app}>
      <Navigation />
      <div className={styles.content}>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={<r.element />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
