import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Navigation.module.css";

const items = [
  { to: "/", label: "Календарь" },
  { to: "/workers", label: "Работники" },
  { to: "/boxes", label: "Боксы" },
  { to: "/bookings", label: "Записи" },
];

const Navigation = () => {
  const location = useLocation();
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <NavLink key={item.to} to={item.to} className={styles.link}>
            <motion.div
              className={styles.item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              animate={active ? { backgroundColor: "#1a1a1a" } : {}}
            >
              <span className={styles.dot} />
              <span className={styles.text}>{item.label}</span>
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;


