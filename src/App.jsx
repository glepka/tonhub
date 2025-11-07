import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "./routes/index.js";
import Navigation from "./components/Navigation/Navigation.jsx";
import styles from "./styles/App.module.css";
import { initTelegram } from "./utils/telegram.js";
import { useWorkersStore } from "./store/useWorkersStore.js";
import { useBoxesStore } from "./store/useBoxesStore.js";
import { useBookingsStore } from "./store/useBookingsStore.js";
import { useSettingsStore } from "./store/useSettingsStore.js";

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
