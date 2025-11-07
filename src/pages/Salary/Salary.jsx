import styles from "./Salary.module.css";
import PeriodSalary from "../../components/Salary/PeriodSalary.jsx";
import WorkerSalary from "../../components/Salary/WorkerSalary.jsx";
import { useEffect } from "react";
import { useServicesStore } from "../../store/useServicesStore.js";
import { useWorkersStore } from "../../store/useWorkersStore.js";
import { useSettingsStore } from "../../store/useSettingsStore.js";

const SalaryPage = () => {
  // hydrate services and workers on page entry
  useEffect(() => {
    useServicesStore.getState().hydrate?.();
    useWorkersStore.getState().hydrate?.();
    useSettingsStore.getState().hydrate?.();
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Зарплата</h1>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Настройки выплат</h2>
          <SettingsPanel />
        </section>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Сотрудник за период</h2>
          <WorkerSalary />
        </section>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Итоги за период</h2>
          <PeriodSalary />
        </section>
      </div>
    </div>
  );
};

export default SalaryPage;
const SettingsPanel = () => {
  const salaryPercent = useSettingsStore((s) => s.salaryPercent);
  const setSalaryPercent = useSettingsStore((s) => s.setSalaryPercent);
  return (
    <div className={styles.settings}>
      <div className={styles.settingsRow}>
        <label className={styles.settingsLabel}>
          <span>Процент выплаты из записи</span>
          <input
            className={styles.settingsInput}
            type="number"
            min="0"
            max="100"
            step="1"
            value={salaryPercent}
            onChange={(e) => setSalaryPercent(e.target.value)}
          />
          <span>%</span>
        </label>
      </div>
    </div>
  );
};
