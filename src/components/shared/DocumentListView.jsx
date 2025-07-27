// src/components/shared/DocumentListView.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FaArrowRight } from 'react-icons/fa';
import { DocumentTable } from './DocumentTable';
import styles from '../../styles/shared/DocumentView.module.css';

export const DocumentListView = ({
  pageTitle,      
  listTitle, 
  queryKey,
  documentService,
  routePaths,
  newDocumentMessage,
  columns, // PROP: La configuración de las columnas de la tabla
  FilterComponent, // PROP: El componente que renderizará los filtros
  ActionsComponent, // PROP: El componente que renderizará los botones de acción (Nuevo, Ordenar, etc.)
  initialFetchEnabled = true, // <-- NUEVA PROP: true por defecto
  showRowActions = true, // <-- NUEVA PROP: true por defecto
  emptyListMessage = "No hay documentos para mostrar." // <-- NUEVA PROP: mensaje por defecto
}) => {
  // --- 1. LÓGICA DE HOOKS Y ESTADO (SIN CAMBIOS) ---
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();
  const [sortBy, setSortBy] = useState('status');
  // Ahora el estado de los filtros es más genérico, se adapta a lo que envíe el formulario.
  const [filters, setFilters] = useState({});

  // --- 2. LÓGICA DE DATOS (QUERIES Y MUTATIONS) ---
  const { data: documents = [], isLoading, isError, error } = useQuery({
    queryKey: [queryKey, filters, sortBy],
   queryFn: () => {
      // Lógica final que arregla el error "getAll is not a function".
      if (documentService.getAll && Object.keys(filters).length === 0) {
        return documentService.getAll(sortBy);
      }
      return documentService.search(filters);
    },
    // La query solo se activa si la carga inicial está habilitada O si hay filtros.
    enabled: initialFetchEnabled || Object.keys(filters).length > 0,
    staleTime: 1000 * 60 * 3,
  });

  // Mutaciones no cambian
  const { mutate: approveDoc, isPending: isApproving } = useMutation({
    mutationFn: documentService.approve,
    onSuccess: () => {
      Swal.fire('Aprobado', `El documento ha sido aprobado con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Swal.fire('Error', err.response?.data?.message || `No se pudo aprobar el documento.`, 'error'),
  });
  // ... resto de mutaciones (cancelDoc, deleteDoc) permanecen idénticas

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

  // --- 3. MANEJADORES DE EVENTOS (SIN CAMBIOS EN SU MAYORÍA) ---
const onSearch = (data) => {
    const activeFilters = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value)
    );
    setFilters(activeFilters);
  };
  
  const handleShowAll = () => {
    setFilters({});
    setSortBy('status');
    reset();
  };

  const handleClear = () => {
    setFilters({});
    reset();
  }

  // El resto de manejadores (handleNew, handleEdit, handleDelete, etc.) no cambian.
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
      title: `¿Eliminar documento?`, text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && deleteDoc(id));
  };
  
  const handleApprove = (id) => {
    Swal.fire({
      title: `¿Aprobar documento?`, text: 'El estado del documento cambiará.', icon: 'question',
      showCancelButton: true, confirmButtonText: 'Sí, aprobar', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && approveDoc(id));
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: `¿Anular documento?`, text: 'Esta acción podría revertir cambios de inventario.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, anular', cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed && cancelDoc(id));
  };

  // --- 4. RENDERIZADO DEL ESQUELETO ---
  return (
    <main>
      <h2 className="mb-4">{pageTitle}</h2>
      
      {/* RANURA PARA FILTROS */}
      {FilterComponent && (
        <FilterComponent
          register={register}
          handleSubmit={handleSubmit}
          onSearch={onSearch}
          watch={watch}
          handleClear={handleClear}
          handleShowAll={handleShowAll}
          styles={styles}
        />
      )}
      
      <div className="mt-4 mb-3">
        
        {/* RANURA PARA ACCIONES */}
        {ActionsComponent && (
          <ActionsComponent
            listTitle={listTitle}
            handleNew={handleNew}
            setSortBy={setSortBy}
            sortBy={sortBy}
            filters={filters}
            styles={styles}
            documents={documents}
          />
        )}
      </div>

      <div className={styles.tableContainer + ' table-responsive'}>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              {/* Cabeceras dinámicas basadas en la configuración */}
              {columns.map((col) => <th key={col.header}>{col.header}</th>)}
              {showRowActions && <th className="text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            <DocumentTable
              documents={documents}
              columns={columns} // Pasa la configuración a la tabla
              isLoading={isLoading}
              isError={isError}
              error={error}
              styles={styles}
              showRowActions={showRowActions}
              emptyMessage={emptyListMessage}
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