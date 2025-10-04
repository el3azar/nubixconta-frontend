import React from "react";
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import { FaSearch } from "react-icons/fa";

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onSearch }) => {
  return (
   <section className={styles.buscador}>
  <div className={styles.fechaGrupo}>
    <label htmlFor="startDate">Inicio:</label>
    <input
      id="startDate"
      type="date"
      value={startDate}
      onChange={(e) => onStartDateChange(e.target.value)}
    />
  </div>

  <div className={styles.fechaGrupo}>
    <label htmlFor="endDate">Fin:</label>
    <input
      id="endDate"
      type="date"
      value={endDate}
      onChange={(e) => onEndDateChange(e.target.value)}
    />
  </div>

<button className={styles.btnBuscar} onClick={onSearch}>
  <FaSearch style={{ marginRight: "0.5rem" }} />
  Buscar
</button>
</section>

  );
};

export default DateRangeFilter;
