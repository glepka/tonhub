import React from "react";
import styles from "./WorkerCard.module.css";
import Button from "../Button/Button.jsx";

const WorkerCard = ({ worker, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div>
          <div className={styles.name}>{worker.name}</div>
          <div className={styles.role}>{worker.role}</div>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => onEdit(worker)}>Редактировать</Button>
          <Button variant="danger" onClick={() => onDelete(worker.id)}>Удалить</Button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;


