import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Navigation.module.css";

const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 18c0-3 4-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 18c0-2 3-3 5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 11l9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="5" y="10" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="8" y="12" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="9" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const BanknoteIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const items = [
  { to: "/", label: "Календарь", icon: CalendarIcon },
  { to: "/workers", label: "Работники", icon: UsersIcon },
  { to: "/boxes", label: "Боксы", icon: CubeIcon },
  { to: "/bookings", label: "Записи", icon: ClipboardIcon },
  { to: "/salary", label: "Зарплата", icon: BanknoteIcon },
];

const Navigation = () => {
  const location = useLocation();
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <NavLink key={item.to} to={item.to} className={styles.link} aria-label={item.label}>
            <motion.div
              className={styles.item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              animate={active ? { backgroundColor: "#1a1a1a" } : {}}
            >
              <span className={`${styles.dot} ${active ? styles.dotActive : styles.dotInactive}`} />
              <item.icon className={styles.icon} />
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;


