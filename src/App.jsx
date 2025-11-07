import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import routes from "./routes/index.js";
import Navigation from "./components/Navigation/Navigation.jsx";
import styles from "./styles/App.module.css";
import { initTelegram } from "./utils/telegram.js";
import { useWorkersStore } from "./store/useWorkersStore.js";
import { useBoxesStore } from "./store/useBoxesStore.js";
import { useBookingsStore } from "./store/useBookingsStore.js";

const App = () => {
  useEffect(() => {
    initTelegram();
    // hydrate state from Telegram Cloud or localStorage fallback
    useWorkersStore.getState().hydrate?.();
    useBoxesStore.getState().hydrate?.();
    useBookingsStore.getState().hydrate?.();
  }, []);

  return (
    <div className={styles.app}>
      <Navigation />
      <div className={styles.content}>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={<r.element />} />
          ))}
        </Routes>
      </div>
    </div>
  );
};

export default App;


