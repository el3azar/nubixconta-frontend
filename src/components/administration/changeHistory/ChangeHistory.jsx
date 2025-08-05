import React, { useState, useEffect } from 'react';
import { getAllUsers, getChangeHistory, getChangeHistoryByUser, getChangeHistoryByDateRange } from '../../../services/administration/change/historyServices';
import styles from '../../../styles/administration/changeHistory.module.css';
import SearchFilters from './SearchFilters'; // Importa el nuevo componente de filtros
import formStyles from '../../../styles/sales/CustomerForm.module.css';
export default function ChangeHistory() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res.data.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    getChangeHistory()
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  const onSearch = () => {
    const userSelected = selectedUser !== '';
    const dateRangeSelected = startDate !== '' && endDate !== '';
    
    let startISO = '';
    let endISO = '';

    if (startDate) {
      startISO = new Date(startDate + 'T00:00:00.000Z').toISOString();
    }
    if (endDate) {
      endISO = new Date(endDate + 'T23:59:59.999Z').toISOString();
    }

    if (userSelected && dateRangeSelected) {
      getChangeHistoryByUser(selectedUser, startISO, endISO)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    } else if (userSelected) {
      getChangeHistoryByUser(selectedUser)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    } else if (dateRangeSelected) {
      getChangeHistoryByDateRange(startISO, endISO)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    } else {
      getChangeHistory()
        .then(res => setHistory(res.data))
        .catch(err => console.error(err));
    }
  };

  return (
    <div className={styles.container}>
      <h2>Bitácora de cambios</h2>
      
      {/* Usando el nuevo componente de filtros */}
      <SearchFilters
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onSearch={onSearch}
      />

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th className={styles.actionHeader}>Acción realizada</th>
              <th>Módulo</th>
              <th>Empresa</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td>{item.userFullName || '-'}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{new Date(item.date).toLocaleTimeString()}</td>
                  <td className={styles.actionCell}>{item.actionPerformed}</td>
                  <td>{item.moduleName}</td>
                  <td>{item.companyName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noResults}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}