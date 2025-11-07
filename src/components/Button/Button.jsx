import React from "react";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

const Button = ({ children, onClick, variant = "primary", type = "button" }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;


