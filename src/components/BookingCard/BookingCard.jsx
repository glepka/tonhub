import React from "react";
import styles from "./BookingCard.module.css";
import Button from "../Button/Button.jsx";

const BookingCard = ({ booking, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.title}>{booking.client} • {booking.car}</div>
        <div className={styles.price}>{booking.price ? `${booking.price} ₽` : ""}</div>
      </div>
      <div className={styles.sub}>{booking.service} • {new Date(booking.datetime).toLocaleString()}</div>
      {booking.workers?.length ? (
        <div className={styles.workers}>Работники: {booking.workers.join(", ")}</div>
      ) : null}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => onEdit(booking)}>Редактировать</Button>
        <Button variant="danger" onClick={() => onDelete(booking.id)}>Удалить</Button>
      </div>
    </div>
  );
};

export default BookingCard;


