export const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getWeekRange = (d) => {
  const day = d.getDay() || 7; // Monday-first
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return new Array(7).fill(0).map((_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
};

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export const getDayLabel = (d) => {
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${dayNames[d.getDay()]} • ${dd}.${mm}`;
};


