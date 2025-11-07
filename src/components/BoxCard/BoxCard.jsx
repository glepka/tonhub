import React from "react";
import styles from "./BoxCard.module.css";
import Button from "../Button/Button.jsx";

const BoxCard = ({ box, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div>
          <div className={styles.name}>Бокс #{box.number}</div>
          <div className={styles.desc}>{box.description || "—"}</div>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => onEdit(box)}>Редактировать</Button>
          <Button variant="danger" onClick={() => onDelete(box.id)}>Удалить</Button>
        </div>
      </div>
    </div>
  );
};

export default BoxCard;


