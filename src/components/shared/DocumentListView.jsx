// src/components/shared/DocumentListView.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Notifier } from '../../utils/alertUtils';
import { FaArrowRight } from 'react-icons/fa';
import { DocumentTable } from './DocumentTable';
import styles from '../../styles/shared/DocumentView.module.css';
import { useCompany } from '../../context/CompanyContext';
import AccountingEntryModal from './AccountingEntryModal'; // <-- Importar el nuevo modal
import { useAccountingModal } from '../../hooks/useAccountingModal';

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
  emptyListMessage = "No hay documentos para mostrar.", // <-- NUEVA PROP: mensaje por defecto
 showLegend = false
}) => {
  // --- 1. LÓGICA DE HOOKS Y ESTADO (SIN CAMBIOS) ---
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();
  const [sortBy, setSortBy] = useState('status');
  // Ahora el estado de los filtros es más genérico, se adapta a lo que envíe el formulario.
  const [filters, setFilters] = useState({});

  const { company } = useCompany();

  // --- CAMBIO: TODA LA LÓGICA DEL MODAL SE REEMPLAZA POR ESTA LÍNEA ---
  const {
    isModalOpen,
    openAccountingModal,
    closeAccountingModal,
    modalData,
    isModalLoading,
    isModalError,
    modalError
  } = useAccountingModal();

  // --- 2. LÓGICA DE DATOS (QUERIES Y MUTATIONS) ---
 const { data: documents = [], isLoading, isError, error } = useQuery({
    // La queryKey sigue dependiendo de `company`. Esto es CRUCIAL.
    // Cuando `company` cambia de null al objeto real, la key cambia y react-query actúa.
    queryKey: [queryKey, company?.id, filters, sortBy], 
    
    // La función de la consulta no cambia fundamentalmente.
    queryFn: () => {
      // Importante: No ejecutar si no hay compañía (aunque 'enabled' ya lo previene).
      // Esto se lee como: "si 'company' existe, dame su 'id', si no, evalúa como undefined".
      if (!company?.id) {
          return Promise.resolve([]); // No hacer nada si no hay ID de empresa.
      }

      if (documentService.getAll && Object.keys(filters).length === 0) {
        return documentService.getAll(sortBy);
      }
      return documentService.search(filters);
    },
    
     // La consulta solo se habilita si se cumplen las siguientes reglas:
    // 1. Siempre debe haber una empresa (`!!company?.id`).
    // 2. Y ADEMÁS, o bien (a) la carga inicial está permitida (para Ventas/NC)
    //    O (b) el usuario ya ha aplicado algún filtro (para Reportes).
    enabled: !!company?.id && (initialFetchEnabled || Object.keys(filters).length > 0),
    
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false, // Buena práctica para evitar refetch innecesarios.
  });

  // Mutaciones no cambian
  const { mutate: approveDoc, isPending: isApproving } = useMutation({
    mutationFn: documentService.approve,
    onSuccess: () => {
      Notifier.success('El documento ha sido aprobado con éxito.');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Notifier.showError('Error', err.response?.data?.message || `No se pudo aprobar el documento.`),
  });
  // ... resto de mutaciones (cancelDoc, deleteDoc) permanecen idénticas

  const { mutate: cancelDoc, isPending: isCancelling } = useMutation({
    mutationFn: documentService.cancel,
    onSuccess: () => {
      Notifier.success('El documento ha sido anulado con éxito.');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Notifier.showError('Error', err.response?.data?.message || `No se pudo anular el documento.`),
  });
  
  const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      Notifier.success('El documento ha sido eliminado con éxito.');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => Notifier.showError('Error', err.response?.data?.message || `No se pudo eliminar el documento.`),
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
   // Usamos tu mensaje original
    const toastMessage = newDocumentMessage || `Redirigiendo...`;

    // --- ¡AQUÍ ESTÁ LA MAGIA! ---
    // Llamamos a Notifier.info y le pasamos un objeto de opciones
    // para personalizar el icono.
    Notifier.info(toastMessage, {
      icon: <FaArrowRight style={{ color: '#7D49CC' }} />,
    });
    setTimeout(() => navigate(routePaths.new), 100);
  };
  const handleEdit = (id) => navigate(`${routePaths.edit}/${id}`);
  const handleView = (doc) => openAccountingModal(doc);

const handleDelete = async (id) => {
    const result = await Notifier.confirm({
      title: '¿Eliminar documento?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) deleteDoc(id);
  };
  
  const handleApprove = async (id) => {
    const result = await Notifier.confirm({
      title: '¿Aprobar documento?',
      text: 'El estado del documento cambiará y se afectará el inventario.',
      confirmButtonText: 'Sí, aprobar'
    });
    if (result.isConfirmed) approveDoc(id);
  };

  const handleCancel = async (id) => {
    const result = await Notifier.confirm({
      title: '¿Anular documento?',
      text: 'Esta acción podría revertir cambios de inventario.',
      confirmButtonText: 'Sí, anular'
    });
    if (result.isConfirmed) cancelDoc(id);
  };

  // PASO 2: GUARDIA DE RENDERIZADO CONDICIONAL (AHORA ESTÁ AQUÍ)
  // Después de que TODOS los hooks han sido llamados, ahora sí podemos
  // decidir qué JSX mostrar.
  // ==================================================================
  if (!company) {
    return (
      <main>
        <h2 className={`mb-4 ${styles.sectionTitle}`}>{pageTitle}</h2>
        <div className="text-center mt-5">
          {/* <Spinner /> Si tienes un componente de Spinner */}
          <p className="mt-2">Esperando selección de empresa...</p>
        </div>
      </main>
    );
  }

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

      {/* --- INICIO DE LA MODIFICACIÓN: Renderizado condicional --- */}
      {showLegend && (
        <div className={styles.legendWrapper}>
          <div className={styles.legendContainer}>
              <span className={styles.legendItem}>
                  <span className={`${styles.colorBox} ${styles.colorPending}`}></span> Pendiente
              </span>
              <span className={styles.legendItem}>
                  <span className={`${styles.colorBox} ${styles.colorApplied}`}></span> Aplicada
              </span>
              <span className={styles.legendItem}>
                  <span className={`${styles.colorBox} ${styles.colorCancelled}`}></span> Anulada
              </span>
          </div>
        </div>
      )}
      {/* --- FIN DE LA MODIFICACIÓN --- */}

      <div className={styles.tableWrapper}>
        <table className="table table-hover align-middle">
          <thead className={styles.salesTableHeader}>
            <tr>
              {/* Cabeceras dinámicas basadas en la configuración */}
              {columns.map((col) => <th key={col.header} style={col.style || {}} className={col.className || styles.textAlignCenter}>{col.header}</th>)}
              {showRowActions && <th className="text-center"  style={{ minWidth: '150px' }}>Acciones</th>}
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
      {/* --- RENDERIZADO DEL MODAL --- */}
      <AccountingEntryModal
        show={isModalOpen}
        onHide={closeAccountingModal}
        data={modalData}
        isLoading={isModalLoading}
        isError={isModalError}
        error={modalError}
      />
    </main>
  );
};