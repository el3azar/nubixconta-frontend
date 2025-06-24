import React from 'react'
import { FaEye } from 'react-icons/fa'
import styles from '../../styles/sales/DesactivatedCustomer.module.css'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const mockCustomers = [
  {
    id: 1,
    nombre: 'Lili Daniels',
    dui: 'Lili Daniels',
    nit: 'Manager, Design',
    direccion: 'Manager, Design',
    correo: 'manager@example.com',
    telefono: '123-4567',
    diasCredito: '$190,000.00',
    limiteCredito: '$190,000.00'
  },
  {
    id: 2,
    nombre: 'Henrietta Whitney',
    dui: 'Henrietta Whitney',
    nit: 'Product Designer',
    direccion: 'Product Designer',
    correo: 'henrietta@example.com',
    telefono: '234-5678',
    diasCredito: '$130,000.00',
    limiteCredito: '$130,000.00'
  },
  {
    id: 3,
    nombre: 'Seth McDaniel',
    dui: 'Seth McDaniel',
    nit: 'Senior Product Designer',
    direccion: 'Senior Product Designer',
    correo: 'seth@example.com',
    telefono: '345-6789',
    diasCredito: '$175,000.00',
    limiteCredito: '$175,000.00'
  },
  {
    id: 4,
    nombre: 'Edward King',
    dui: 'Edward King',
    nit: 'Director, Design',
    direccion: 'Director, Design',
    correo: 'edward@example.com',
    telefono: '456-7890',
    diasCredito: '$250,000.00',
    limiteCredito: '$250,000.00'
  }
]

const DesactivatedCustomer = ({ customers = mockCustomers }) => {
  const handleActivate = (id) => {
    const cliente = customers.find(c => c.id === id)

    
    console.log('handleActivate fired for', id)

    Swal.fire({
      title: `¿Reactivar a ${cliente?.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'No'
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return

      // Aquí iría tu llamada real a la API...
      console.log('👉 API call simulate activate', id)

      Swal.fire({
        title: '¡Reactivado!',
        text: `Cliente ${cliente?.nombre} está activo.`,
        icon: 'success'
      })
    })
  }

  

  const handleBack = () => window.history.back()

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>Clientes Desactivados</h2>

      <div className={styles.tableContainer}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DUI</th>
              <th>NIT</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Días de Crédito</th>
              <th>Límite de Crédito</th>
              <th>Activar</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.dui}</td>
                <td>{c.nit}</td>
                <td>{c.direccion}</td>
                <td>{c.correo}</td>
                <td>{c.telefono}</td>
                <td>{c.diasCredito}</td>
                <td>{c.limiteCredito}</td>
                <td>
                  <FaEye
                    className={styles.eyeIcon}
                    onClick={() => handleActivate(c.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className={`btn btn-outline-dark ${styles.backButton}`}
        onClick={handleBack}
      >
        Regresar
      </button>
    </section>
  )
}

export default DesactivatedCustomer
