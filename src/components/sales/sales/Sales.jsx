// Ubicación: src/components/sales/Sales.jsx
// Descripción: Componente refactorizado para listar y gestionar ventas.
// Se utiliza TanStack Query para el estado del servidor y React Hook Form para los filtros,
// manteniendo el diseño y la funcionalidad originales.

import React, { useState } from 'react';
import { FaSearch, FaPlusCircle, FaEye, FaPen, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// --- Imports de la nueva arquitectura ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { SaleService } from '../../../services/sales/SaleService'; // El nuevo y correcto servicio

// --- Imports de diseño (se mantienen) ---
import styles from '../../../styles/sales/Sales.module.css';
import SubMenu from "../SubMenu"; 
import { formatDate } from '../../../utils/dateFormatter';

const Sales = () => {
  // --- 1. CONFIGURACIÓN DE HOOKS Y SERVICIOS ---
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Instanciamos el servicio a través del hook.
  const saleService = SaleService(); 
  
  // Estado local para los filtros de búsqueda.
  // Este estado actúa como el puente entre el formulario y la query de TanStack.
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  // Hook para manejar el formulario de filtros.
  const { register, handleSubmit,reset,watch } = useForm();

  // Helper para mostrar alertas de error de las mutaciones.
  const handleBackendError = (error, fallbackMsg) => {
    const message = error?.response?.data?.message || fallbackMsg;
    Swal.fire({
      icon: 'error',
      title: 'Ocurrió un Error',
      text: message,
    });
  };

  // --- 2. GESTIÓN DEL ESTADO DEL SERVIDOR CON TANSTACK QUERY ---

  // useQuery para obtener las ventas.
  // La clave de la query ahora incluye los filtros para que se re-ejecute cuando cambien.
  const { data: sales = [], isLoading, isError, error } = useQuery({
    queryKey: ['sales', filters],
    queryFn: () => {
      // Lógica condicional: si hay fechas, busca; si no, obtiene todo.
      if (filters.startDate && filters.endDate) {
        return saleService.searchSalesByDate(filters);
      }
      return saleService.getAllSales();
    },
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos
  });

  // useMutation para APROBAR una venta.
  const { mutate: approveSale, isPending: isApproving } = useMutation({
    mutationFn: saleService.approveSale,
    onSuccess: () => {
      Swal.fire('Aprobada', 'La venta ha sido aprobada con éxito.', 'success');
      // Invalida la query para que la tabla se actualice automáticamente.
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'No se pudo aprobar la venta.', 'error'),
  });

  // useMutation para ANULAR una venta.
  const { mutate: cancelSale, isPending: isCancelling } = useMutation({
    mutationFn: saleService.cancelSale,
    onSuccess: () => {
      Swal.fire('Anulada', 'La venta ha sido anulada con éxito.', 'success');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'No se pudo anular la venta.', 'error'),
  });

  // useMutation para ELIMINAR una venta.
  const { mutate: deleteSale, isPending: isDeleting } = useMutation({
    mutationFn: saleService.deleteSale,
    onSuccess: () => {
      Swal.fire('Eliminada', 'La venta ha sido eliminada con éxito.', 'success');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || 'No se pudo eliminar la venta.', 'error'),
  });

  // --- 3. MANEJADORES DE EVENTOS SIMPLIFICADOS ---

  // Se ejecuta al enviar el formulario de búsqueda.
  const onSearch = (data) => {
    // Actualiza el estado 'filters', lo que automáticamente dispara el refetch de useQuery.
    setFilters({
      startDate: data.startDate || '',
      endDate: data.endDate || ''
    });
  };

  // Los manejadores de acciones ahora solo muestran la alerta y llaman a la mutación.
  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar venta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSale(id);
      }
    });
  };

  const handleApprove = (id) => {
    Swal.fire({
      title: '¿Aprobar venta?',
      text: 'Confirmar que la venta pasará a estado APLICADA.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        approveSale(id);
      }
    });
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: '¿Anular venta?',
      text: 'La venta quedará en estado ANULADA.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelSale(id);
      }
    });
  };

  
  // Se mantiene la navegación para las vistas de editar/ver
  const handleEdit = (id) => navigate(`/ventas/editar/${id}`);
  const handleView = (id) => navigate(`/ventas/ver/${id}`);

  return (
    <>
      <SubMenu />
      {/* El JSX y las clases de CSS se mantienen intactos para no afectar el diseño */}
      <main>
        <h2 className="mb-4">Filtrar Ventas</h2>
        {/* El formulario ahora usa handleSubmit de React Hook Form */}
      <form onSubmit={handleSubmit(onSearch)}>
  <div className={`d-flex align-items-end gap-4 ${styles.filter}`}>
    {/* Fecha Inicio */}
    <div className={styles.filterItem}>
      <label htmlFor="startDate" className="form-label fw-bold">Inicio:</label>
      <input
        type="date"
        id="startDate"
        className="form-control"
        {...register("startDate")}
      />
    </div>
    {/* Fecha Fin */}
    <div className={styles.filterItem}>
      <label htmlFor="endDate" className="form-label fw-bold">Fin:</label>
      <input
        type="date"
        id="endDate"
        className="form-control"
        {...register("endDate")}
      />
    </div>
    {/* Botones */}
    <div className="d-flex gap-2 ms-auto">
      <button type="submit" className={styles.actionButton}>
        <FaSearch className="me-2" /> <span className="fw-bold">Buscar</span>
      </button>
      {(watch("startDate") || watch("endDate")) && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => reset({ startDate: "", endDate: "" })}
        >
          Limpiar Fechas
        </button>
      )}
      <button
        type="button"
        className={styles.actionButton}
        onClick={() => {
          setFilters({ startDate: "", endDate: "" });
          reset({ startDate: "", endDate: "" });
        }}
      >
        Mostrar Todos
      </button>
    </div>
  </div>
</form>





       <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <h3>Ventas</h3>
          {/* CAMBIO: Se aplica la clase unificada 'actionButton' al botón "Nuevo" */}
          <Link to="/ventas/clientes" className={styles.actionButton}>
            <FaPlusCircle className="me-1" /> Nuevo
          </Link>
        </div>

        <div className={styles.tableContainer + ' table-responsive'}>
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Correlativo</th>
                <th>N° de Documento</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Días de Crédito</th>
                <th>Descripción</th>
                <th>Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan="9" className="text-center">Cargando ventas...</td></tr>
              )}
             {isError && (
                <tr><td colSpan="9" className="text-center text-danger p-4">
                  <strong>Error al cargar datos:</strong> {error.response?.data?.message || error.message}
                </td></tr>
              )}
              {!isLoading && !isError && sales.length > 0 ? (
                sales.map(sale => (
                  <tr key={sale.saleId} className={
                    sale.saleStatus === 'APLICADA' ? 'table-success' : 
                    sale.saleStatus === 'ANULADA' ? 'table-danger' : ''
                  }>
                    <td>{sale.saleId}</td>
                    <td>{sale.documentNumber}</td>
                    <td>{formatDate(sale.issueDate)}</td>
                    <td>{sale.saleStatus}</td>
                    <td>{sale.customer?.customerName || 'N/A'}</td>
                    <td>{sale.customer?.creditDay || '-'}</td>
                    <td>{sale.saleDescription}</td>
                    <td>${sale.totalAmount?.toFixed(2)}</td>
                    <td className="text-center">
                      <div className={styles.actions}>
                        {sale.saleStatus === 'PENDIENTE' && (
                          <>
                            <FaPen title="Editar" onClick={() => handleEdit(sale.saleId)} />
                            <FaTrashAlt title="Eliminar" onClick={() => handleDelete(sale.saleId)} style={{ pointerEvents: isDeleting ? 'none' : 'auto', opacity: isDeleting ? 0.5 : 1 }} />
                            <FaCheckCircle title="Aprobar" onClick={() => handleApprove(sale.saleId)} style={{ pointerEvents: isApproving ? 'none' : 'auto', opacity: isApproving ? 0.5 : 1 }} />
                          </>
                        )}
                        {sale.saleStatus === 'APLICADA' && (
                          <>
                            <FaEye title="Ver documento" onClick={() => handleView(sale.saleId)} />
                            <FaTimesCircle title="Anular" onClick={() => handleCancel(sale.saleId)} style={{ pointerEvents: isCancelling ? 'none' : 'auto', opacity: isCancelling ? 0.5 : 1 }} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !isLoading && <tr><td colSpan="9" className="text-center">No hay ventas para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Sales;