import React, { useState, useEffect } from 'react'
import { getAllUsers, getAccessLogs } from '../../../services/administration/change/AccessLogService'
import styles from '../../../styles/administration/changeHistory.module.css'
import SearchFilters from './SearchFilters'; 
import { useAuth } from '../../../context/AuthContext'; 

export default function AccessLogs() {
  const { token } = useAuth(); 
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [access, setAccessLogs] = useState([])

  useEffect(() => {
    if (!token) return; 
    getAllUsers()
      .then(res => setUsers(
        res.data.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))
      ))
      .catch(err => console.error(err))
  }, [token]) 

  useEffect(() => {
    if (!token) return; 
    getAccessLogs()
      .then(res => setAccessLogs(res.data))
      .catch(err => console.error(err))
  }, [token]) 

  const onSearch = () => {
    const filters = {};

    if (selectedUser) filters.userId = selectedUser;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    getAccessLogs(filters)
      .then(res => setAccessLogs(res.data))
      .catch(err => console.error(err))
  }

  return (
    <div className={styles.container}>
      <h2>Bitácora de accesos</h2>

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
