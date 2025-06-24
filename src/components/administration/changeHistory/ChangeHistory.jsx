import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getAllUsers, getChangeHistoryByUser, getChangeHistoryByUserAndDates, getChangeHistoryWithoutCompany, getChangeHistoryByDateRange
} from '../../../services/administration/historyServices'
import styles from '../../../styles/administration/changeHistory.module.css'

export default function BitacoraCambios() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [history, setHistory] = useState([])

  // 1) Al montar, cargamos el listado de usuarios para el select
  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(
        res.data.map(u => ({ value: u.id, label: u.username }))
      ))
      .catch(err => console.error(err))
  }, [])

  // 2) Función al click de “Buscar”
  const onSearch = () => {
    if (selectedUser && startDate && endDate) {
      // Usuario + rango de fechas
      getChangeHistoryByUserAndDates(
        selectedUser.value,
        startDate.toISOString(),
        endDate.toISOString()
      ).then(res => setHistory(res.data))
    } else if (selectedUser) {
      // Solo usuario
      getChangeHistoryByUser(selectedUser.value)
        .then(res => setHistory(res.data))
    } else if (startDate && endDate) {
      // Solo rango
      getChangeHistoryByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      ).then(res => setHistory(res.data))
    } else {
      // Sin filtro: podrías recuperar todo… o limpiar
      setHistory([])
    }
  }

  return (
    <div className={styles.container}>
      <h2>Bitácora de cambios</h2>

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
          Buscar 🔍
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Acción realizada</th>
            <th>Módulo</th>
            <th>Empresa</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.user?.username}</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{new Date(item.date).toLocaleTimeString()}</td>
              <td>{item.actionPerformed}</td>
              <td>{item.moduleName}</td>
              <td>{item.company?.name || '-'}</td>
            </tr>
          ))}
          {history.length === 0 && (
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
