import React, { useState } from "react";
import styles from "./Boxes.module.css";
import BoxCard from "../../components/BoxCard/BoxCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Button from "../../components/Button/Button.jsx";
import { useBoxesStore } from "../../store/useBoxesStore.js";

const Boxes = () => {
  const { boxes, addBox, updateBox, removeBox } = useBoxesStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      number: form.get("number"),
      description: form.get("description"),
    };
    if (editing) {
      await updateBox(editing.id, payload);
    } else {
      await addBox(payload);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1 className={styles.title}>Боксы</h1>
        <Button onClick={() => setOpen(true)}>Добавить</Button>
      </div>
      <div className={styles.grid}>
        {boxes.map((b) => (
          <BoxCard
            key={b.id}
            box={b}
            onEdit={(box) => { setEditing(box); setOpen(true); }}
            onDelete={removeBox}
          />
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Редактировать бокс" : "Новый бокс"}>
        <form className={styles.form} onSubmit={onSubmit}>
          <input name="number" required placeholder="Название" defaultValue={editing?.number || ""} />
          <input name="description" placeholder="Описание" defaultValue={editing?.description || ""} />
          <Button type="submit">Сохранить</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Boxes;


