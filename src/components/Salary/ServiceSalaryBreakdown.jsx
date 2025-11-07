import { useMemo } from "react";
import styles from "./ServiceSalaryBreakdown.module.css";
import { calculateServiceSplit, getServiceTotalSalary, formatCurrency } from "../../utils/salary.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";

const ServiceSalaryBreakdown = ({ service }) => {
  const workers = useWorkersStore((s) => s.workers);

  const split = useMemo(() => calculateServiceSplit(service), [service]);
  const total = useMemo(() => getServiceTotalSalary(service), [service]);

  const workerMap = useMemo(() => workers.reduce((acc, w) => { acc[w.id] = w; return acc; }, {}), [workers]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <strong>{service.title}</strong> — {service.dateISO}
        </div>
        <div>Итого: {formatCurrency(total)}</div>
      </div>
      <div className={styles.grid}>
        {Object.keys(split).map((wid) => (
          <div key={wid} className={styles.item}>
            <div className={styles.name}>{workerMap[wid]?.name || wid}</div>
            <div className={styles.amount}>{formatCurrency(split[wid])}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSalaryBreakdown;


