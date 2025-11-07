import { useMemo, useState, useCallback } from "react";
import styles from "./ServiceList.module.css";
import { useServicesStore } from "../../store/useServicesStore.js";
import { getServiceTotalSalary, formatCurrency } from "../../utils/salary.js";
import ServiceSalaryBreakdown from "../Salary/ServiceSalaryBreakdown.jsx";

const ServiceList = () => {
  const services = useServicesStore((s) => s.services);
  const [openId, setOpenId] = useState(null);

  const rows = useMemo(() => {
    return services.map((s) => ({
      ...s,
      total: getServiceTotalSalary(s),
      workersCount: Array.isArray(s.workerIds) ? s.workerIds.length : 0,
    }));
  }, [services]);

  const toggle = useCallback((id) => setOpenId((cur) => (cur === id ? null : id)), []);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Дата</th>
            <th>Цена</th>
            <th>%</th>
            <th>Работников</th>
            <th>Зарплата (итого)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <>
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.dateISO}</td>
                <td>{formatCurrency(r.price)}</td>
                <td>{r.percent}</td>
                <td>{r.workersCount}</td>
                <td>{formatCurrency(r.total)}</td>
                <td>
                  <button className={styles.details} onClick={() => toggle(r.id)}>
                    {openId === r.id ? "Скрыть" : "Детали"}
                  </button>
                </td>
              </tr>
              {openId === r.id && (
                <tr className={styles.detailsRow}>
                  <td colSpan={7}>
                    <ServiceSalaryBreakdown service={r} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceList;


