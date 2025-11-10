import React, { useState } from "react";
import styles from "./Workers.module.css";
import WorkerCard from "../../components/WorkerCard/WorkerCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import { useWorkersStore } from "../../store/useWorkersStore.js";

const Workers = () => {
  const { workers, addWorker, updateWorker, removeWorker } = useWorkersStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      role: form.get("role"),
    };
    if (editing) {
      await updateWorker(editing.id, payload);
    } else {
      await addWorker(payload);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1 className={styles.title}>Работники</h1>
        <Button onClick={() => setOpen(true)}>Добавить</Button>
      </div>
      <div className={styles.grid}>
        {workers.map((w) => (
          <WorkerCard
            key={w.id}
            worker={w}
            onEdit={(worker) => { setEditing(worker); setOpen(true); }}
            onDelete={removeWorker}
          />
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Редактировать работника" : "Новый работник"}>
        <form className={styles.form} onSubmit={onSubmit}>
          <input name="name" required placeholder="Имя" defaultValue={editing?.name || ""} />
          <input name="role" required placeholder="Должность" defaultValue={editing?.role || ""} />
          <Button type="submit">Сохранить</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Workers;


