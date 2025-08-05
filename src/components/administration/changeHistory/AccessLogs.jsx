import React, { useState, useEffect } from 'react'
import {
  getAllUsers,
  getAccessLogs,
} from '../../../services/administration/change/AccessLogService'
import styles from '../../../styles/administration/changeHistory.module.css'
import SearchFilters from './SearchFilters'; 

export default function AccessLogs() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [access, setAccessLogs] = useState([])

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(
        res.data.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))
      ))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    getAccessLogs()
      .then(res => setAccessLogs(res.data))
      .catch(err => console.error(err))
  }, [])

const onSearch = () => {
 const filters = {};

    if (selectedUser) {
     filters.userId = selectedUser;
    }

      if (startDate) {
 filters.startDate = startDate; // El backend espera un formato 'YYYY-MM-DD'
 }

    if (endDate) {
     filters.endDate = endDate; // El backend espera un formato 'YYYY-MM-DD'
     }

       getAccessLogs(filters)
     .then(res => setAccessLogs(res.data))
     .catch(err => console.error(err))
 }

  return (
    <div className={styles.container}>
      <h2>Bitácora de accesos</h2>

      {/* Usando el nuevo componente de filtros y pasando los props */}
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

      {/* Usando los estilos de la tabla del primer componente */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Fecha de inicio</th>
              <th>Hora de inicio</th>
              <th>Fecha de fin</th>
              <th>Hora de fin</th>
            </tr>
          </thead>
          <tbody>
            {access.length > 0 ? (
              access.map((item) => {
                const startDateTime = item.dateStartDate && item.dateStartTime
                  ? new Date(`${item.dateStartDate}T${item.dateStartTime}`)
                  : null;

                const endDateTime = item.dateEndDate && item.dateEndTime
                  ? new Date(`${item.dateEndDate}T${item.dateEndTime}`)
                  : null;

                return (
                  <tr key={item.id}>
                    <td>{item.user?.firstName} {item.user?.lastName}</td>
                    <td>{startDateTime ? startDateTime.toLocaleDateString() : '-'}</td>
                    <td>{startDateTime ? startDateTime.toLocaleTimeString() : '-'}</td>
                    <td>{endDateTime ? endDateTime.toLocaleDateString() : '-'}</td>
                    <td>{endDateTime ? endDateTime.toLocaleTimeString() : '-'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className={styles.noResults}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}