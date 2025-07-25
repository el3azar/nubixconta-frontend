/**
 * DocumentListView.jsx
 * ----------------------------------------------------------------------
 * PROPÓSITO:
 * Este es un componente "inteligente" o "contenedor" genérico y reutilizable,
 * diseñado para ser el motor de cualquier vista de listado de documentos.
 * Es el cerebro que orquesta toda la página.
 *
 * FUNCIONAMIENTO:
 * 1.  GESTIÓN DE ESTADO: Maneja todos los estados locales de la UI, como
 *     los filtros de fecha y el criterio de ordenamiento (sortBy).
 * 2.  LÓGICA DE DATOS: Contiene toda la lógica de TanStack Query (useQuery
 *     para obtener los datos y useMutation para las acciones como aprobar,
 *     anular, eliminar).
 * 3.  MANEJO DE EVENTOS: Define todas las funciones manejadoras (onSearch,
 *     handleDelete, etc.) que se pasarán a los componentes de la UI.
 * 4.  ORQUESTACIÓN DE UI: Renderiza la estructura principal de la página
 *     y compone los sub-componentes de presentación (como el formulario de
 *     filtros y la tabla), pasándoles los datos y funciones necesarios.
 *
 * REUTILIZACIÓN:
 * Su diseño genérico, basado en props de configuración (documentType,
 * queryKey, documentService, routePaths), le permite ser utilizado para
 * renderizar la lista de Ventas, Notas de Crédito, Compras, o cualquier
 * otro módulo similar, eliminando la duplicación masiva de código.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FaSearch, FaPlusCircle, FaArrowRight } from 'react-icons/fa';
import { DocumentTable } from './DocumentTable';
import styles from '../../styles/sales/Sales.module.css'; // Usamos un único CSS para mantener el estilo

export const DocumentListView = ({
  documentType,   // "Venta" o "Nota de Crédito"
  queryKey,       // "sales" o "creditNotes"
  documentService, // El servicio adaptado
  routePaths,      // Objeto con las rutas
 newDocumentMessage //mensaje toast
}) => {
  // --- 1. HOOKS ---
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();

  // --- 2. ESTADO ---
  const [sortBy, setSortBy] = useState('status');
  const [dateFilters, setDateFilters] = useState({ startDate: '', endDate: '' });

  // --- 3. LÓGICA DE DATOS (QUERIES Y MUTATIONS) ---
  const { data: documents = [], isLoading, isError, error } = useQuery({
    queryKey: [queryKey, dateFilters, sortBy],
    queryFn: () => {
      if (dateFilters.startDate && dateFilters.endDate) {
        return documentService.searchByDate(dateFilters);
      }
      return documentService.getAll(sortBy);
    },
    staleTime: 1000 * 60 * 3,
  });

  const { mutate: approveDoc, isPending: isApproving } = useMutation({
    mutationFn: documentService.approve,
    onSuccess: () => {
      Swal.fire('Aprobado', `El documento ha sido aprobado con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || `No se pudo aprobar el documento.`, 'error'),
  });

  const { mutate: cancelDoc, isPending: isCancelling } = useMutation({
    mutationFn: documentService.cancel,
    onSuccess: () => {
      Swal.fire('Anulado', `El documento ha sido anulado con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || `No se pudo anular el documento.`, 'error'),
  });
  
  const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      Swal.fire('Eliminado', `El documento ha sido eliminado con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || `No se pudo eliminar el documento.`, 'error'),
  });

  // --- 4. MANEJADORES DE EVENTOS ---
  const onSearch = (data) => setDateFilters({ startDate: data.startDate || '', endDate: data.endDate || '' });
  const handleShowAll = () => {
    setDateFilters({ startDate: '', endDate: '' });
    setSortBy('status');
    reset({ startDate: '', endDate: '' });
  };
  const handleClearDates = () => {
    setDateFilters({ startDate: '', endDate: '' });
    reset({ startDate: '', endDate: '' });
  };

  const handleNew = () => {
    const toastMessage = newDocumentMessage || `Redirigiendo para crear ${documentType.toLowerCase()}...`;
    toast(toastMessage, {
      icon: <FaArrowRight style={{ color: '#7D49CC' }} />,
    });
    setTimeout(() => navigate(routePaths.new), 100);
  };
  
  const handleEdit = (id) => navigate(`${routePaths.edit}/${id}`);
  const handleView = (id) => navigate(`${routePaths.view}/${id}`);

  const handleDelete = (id) => {
    Swal.fire({
      title: `¿Eliminar ${documentType.toLowerCase()}?`, text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && deleteDoc(id));
  };
  
  const handleApprove = (id) => {
    Swal.fire({
      title: `¿Aprobar ${documentType.toLowerCase()}?`, text: 'El estado del documento cambiará.', icon: 'question',
      showCancelButton: true, confirmButtonText: 'Sí, aprobar', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && approveDoc(id));
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: `¿Anular ${documentType.toLowerCase()}?`, text: 'Esta acción podría revertir cambios de inventario.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, anular', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && cancelDoc(id));
  };

  // --- 5. RENDERIZADO ---
  return (
    <main>
      <h2 className="mb-4">Filtrar {documentType}s</h2>
      <form onSubmit={handleSubmit(onSearch)}>
        <div className={`d-flex align-items-end gap-4 ${styles.filter}`}>
          <div className={styles.filterItem}><label className="form-label fw-bold">Inicio:</label><input type="date" className="form-control" {...register("startDate")} /></div>
          <div className={styles.filterItem}><label className="form-label fw-bold">Fin:</label><input type="date" className="form-control" {...register("endDate")} /></div>
          <div className="d-flex gap-2 ms-auto">
            <button type="submit" className={styles.actionButton}><FaSearch className="me-2" /> Buscar</button>
            {(watch("startDate") || watch("endDate")) && <button type="button" className={styles.actionButton} onClick={handleClearDates}>Limpiar Fechas</button>}
            <button type="button" className={styles.actionButton} onClick={handleShowAll}>Mostrar Todos</button>
          </div>
        </div>
      </form>

      
      <div className="mt-4 mb-3"> 
        
        {/* 2. Título centrado y con margen inferior */}
        <h3 className="text-center mb-3">{documentType}s</h3>

        {/* 3. Contenedor para los botones con distribución 'between' */}
        <div className="d-flex justify-content-between align-items-center">
          
          {/* Lado izquierdo: Botones de ordenamiento */}
          <div>
            {/* Solo se muestra el contenedor si los botones son visibles */}
            {!(dateFilters.startDate && dateFilters.endDate) && (
              <div className="d-flex gap-2">
                <button className={`${styles.actionButton} ${sortBy !== 'status' ? styles.inactiveSortButton : ''}`}
                  onClick={() => setSortBy('status')} >
                  Ordenar por Estado
                </button>
                <button className={`${styles.actionButton} ${sortBy !== 'date' ? styles.inactiveSortButton : ''}`}
                  onClick={() => setSortBy('date')} >
                  Ordenar por Fecha
                </button>
              </div>
            )}
          </div>

          {/* Lado derecho: Botón de acción principal */}
          <div>
            <button type="button" className={styles.actionButton} onClick={handleNew}>
              <FaPlusCircle className="me-1" /> Nuevo
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer + ' table-responsive'}>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
                <th>Correlativo</th>
                <th>N° Doc.</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Días Crédito</th>
                {/* --- INICIO DEL CAMBIO --- */}
                {/* Renderizado condicional para la columna extra */}
                {documentType === 'Nota de Crédito' && <th>Venta Afectada</th>}
                {/* --- FIN DEL CAMBIO --- */}
                <th>Descripción</th>
                <th>Total</th>
                <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <DocumentTable
              documents={documents}
              documentType={documentType}
              isLoading={isLoading}
              isError={isError}
              error={error}
              styles={styles}
              actionsProps={{
                onEdit: handleEdit,
                onDelete: handleDelete,
                onApprove: handleApprove,
                onCancel: handleCancel,
                onView: handleView,
                isApproving,
                isCancelling,
                isDeleting
              }}
            />
          </tbody>
        </table>
      </div>
    </main>
  );
};