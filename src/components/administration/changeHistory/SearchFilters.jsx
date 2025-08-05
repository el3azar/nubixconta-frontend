import React from 'react';
import styles from '../../../styles/administration/changeHistory.module.css';
import formStyles from '../../../styles/sales/CustomerForm.module.css';

export default function SearchFilters({
  users,
  selectedUser,
  setSelectedUser,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSearch
}) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.filters}>
        <div>
          <label className={styles.label}>Usuario:</label>
          <select
            className={styles.nativeSelect}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Seleccionar usuario...</option>
            {users.map(user => (
              <option key={user.value} value={user.value}>{user.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.label}>Fecha desde:</label>
          <input
            type="date"
            className={styles.nativeInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>hasta:</label>
          <input
            type="date"
            className={styles.nativeInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className={formStyles.registrar} onClick={onSearch}>
          Buscar
        </button>
      </div>
    </div>
  );
}