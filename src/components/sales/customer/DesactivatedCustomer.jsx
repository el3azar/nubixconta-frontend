import React from 'react';
import { FaEye } from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import styles from '../../../styles/sales/DesactivatedCustomer.module.css';
import Swal from 'sweetalert2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { useNavigate } from 'react-router-dom';
import SubMenu from "../SubMenu"; 
import { useCompany } from '../../../context/CompanyContext';

const DesactivatedCustomer = () => {
  // --- LÓGICA NUEVA ---
  const { getInactiveCustomers, reactivateCustomer } = useCustomerService();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { company } = useCompany();

  // useQuery para obtener los clientes inactivos
  const { data: customers = [], isLoading, isError, error } = useQuery({
    queryKey: ['customers', 'inactive',company], // Clave única para esta lista
    queryFn: getInactiveCustomers,
     // Desactivamos la consulta si aún no se ha cargado una empresa en el contexto.
    enabled: !!company, 
  });

  // useMutation para la acción de reactivar
  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: reactivateCustomer,
    onSuccess: () => {
      Swal.fire('¡Reactivado!', 'El cliente está activo de nuevo.', 'success');
      // Invalida las queries de clientes inactivos Y activos para que ambas listas se refresquen
      queryClient.invalidateQueries({ queryKey: ['customers', 'inactive'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo reactivar el cliente.', 'error');
    }
  });

  const handleActivate = (id, name) => {
    Swal.fire({
      title: `¿Reactivar a ${name}?`,
      text: "El cliente volverá a aparecer en la lista principal.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7D49CC',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonColor: '#8581B0',
      cancelButtonText: 'No'
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        reactivate(id);
      }
    });
  };

  const handleBack = () => navigate(-1);

  function formatPhone(phone) {
  if (!phone) return "-";
  return phone.length === 8 ? `${phone.slice(0, 4)}-${phone.slice(4)}` : phone;
}

  return (
    <>
    <SubMenu />
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>Clientes Desactivados:</h2>
      <div className={styles.tableContainer}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
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
            {isLoading && <tr><td colSpan="9" className="text-center">Cargando...</td></tr>}
            {isError && <tr><td colSpan="9" className="text-center text-danger">Error: {error.message}</td></tr>}
            {!isLoading && !isError && customers.length > 0 ? (
              customers.map(c => (
                <tr key={c.clientId}>
                  <td className={styles.colNombre}>{c.customerName}</td>
                  <td className={styles.colApellido}>{c.customerLastName || '-'}</td>
                  <td className={styles.colDui}>{c.customerDui || '-'}</td>
                  <td className={styles.colNit}>{c.customerNit || '-'}</td>
                  <td className={styles.colDireccion}>{c.address}</td>
                  <td className={styles.colCorreo}>{c.email}</td>
                  <td className={styles.colTelefono}>{formatPhone(c.phone)}</td>
                  <td className={styles.colDias}>{c.creditDay}</td>
                  <td className={styles.colLimite}>${c.creditLimit?.toFixed(2)}</td>
                  <td className={styles.colAccion}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <FaEye
                        className={styles.eyeIcon}
                        onClick={() => handleActivate(c.clientId, c.customerName)}
                        style={{ pointerEvents: isReactivating ? 'none' : 'auto', opacity: isReactivating ? 0.5 : 1 }}
                        title="Reactivar Cliente"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !isLoading && <tr><td colSpan="9" className="text-center">No hay clientes desactivados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className={`btn btn-outline-dark ${styles.backButton}`}
        onClick={handleBack}
      >
        <BsArrowLeft style={{fontSize: '1.5rem', marginRight: '0.7rem', verticalAlign: 'middle'}} /> Regresar
      </button>
    </section>
    
    </>
  );
};

export default DesactivatedCustomer;
