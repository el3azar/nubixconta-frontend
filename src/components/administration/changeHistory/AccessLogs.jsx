// ESTA VISTA QUEDA PENDIENTE DE REVISIÓN Y MEJORA

import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getAllUsers, getAccessLogs, getAccessLogsByUser, getAccessLogsByUserAndDates, getAccessLogsByDateRange
} from '../../../services/administration/accessServices'
import styles from '../../../styles/administration/changeHistory.module.css'
import { get } from 'react-hook-form'
import { en } from 'zod/v4/locales'
import { ScissorsLineDashed } from 'lucide-react'

export default function AccessLogs() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [access, setAccessLogs] = useState([])

  // 1) Al montar, cargamos el listado de usuarios para el select
  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(
        res.data.map(u => ({ value: u.id, label:  `${u.firstName} ${u.lastName}` }))
      ))
      .catch(err => console.error(err))
  }, [])

  // 2) Al montar, cargamos el historial completo
  useEffect(() => {
    getAccessLogs()
      .then(res => setAccessLogs(res.data))
      .catch(err => console.error(err))
  }, [])
  
  // 3) Función al click de “Buscar”
  const onSearch = () => {
    if (selectedUser && startDate && endDate) {
      // Usuario + rango de fechas
      getAccessLogsByUserAndDates(
        selectedUser.value,
        startDate.toISOString(),
        endDate.toISOString()
      ).then(res => setAccessLogs(res.data))
    } else if (selectedUser) {
      // Solo usuario
      getAccessLogsByUser(selectedUser.value)
        .then(res => setAccessLogs(res.data))
    } else if (startDate && endDate) {
      // Solo rango
      getAccessLogsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      ).then(res => setAccessLogs(res.data))
    } else {
      // Sin filtro: podrías recuperar todo… o limpiar
      getAccessLogs()
        .then(res => setAccessLogs(res.data))
    }
  }

  return (
    <div className={styles.container}>
      <h2>Bitácora de accesos</h2>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label className={styles.label}>Usuario:</label>
          <Select
            options={users}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Buscar usuario…"
            isClearable
          />
        </div>

        <div className={styles.filterItem}>
          <label className={styles.label}>Fecha desde:</label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Inicio"
          />
          <label className={styles.label}>hasta:</label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fin"
          />
        </div>

        <button className={styles.searchBtn} onClick={onSearch}>
          Buscar
        </button>
      </div>

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
          {access.map((item) => {
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
          })}
          {access.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  )
}
