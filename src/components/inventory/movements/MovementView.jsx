import React, { useState, useMemo, useCallback } from 'react';
import Boton from '../inventoryelements/Boton';
import SearchCardMovement from '../inventoryelements/SearchCardMovement';
import TableComponent from '../inventoryelements/TableComponent';
import SwitchAction from '../inventoryelements/SwitchActionMovement';
import { Link } from 'react-router-dom';
// 1. IMPORTAMOS LAS FUNCIONES DE ALERTA NECESARIAS
import { showSuccess, showError } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';
import './MovementView.css';
import ViewDetailsMovement from './ViewDetailsMovement';
import { formatDate } from '../../../utils/dateFormatter';
import MovementFormModal from './MovementFormModal'; 
// --- NUESTRO ÚNICO HOOK DE LÓGICA ---
import { useMovementLogic } from '../../../hooks/useMovementLogic';
// --- HOOKS ESPECÍFICOS PARA LAS ACCIONES DE ESTA VISTA ---
import { useApplyMovement, useCancelMovement, useDeleteManualMovement, useCreateManualMovement, useUpdateManualMovement } from '../../../hooks/useInventoryMovementQueries';
import SubMenu from "../SubMenu";

const MovementView = () => {
  // ===================================================================
  // == 1. LÓGICA DE ESTADO Y DATOS (SIMPLIFICADA)
  // ===================================================================
  const { movimientos, isLoading, isError, error, searchProps, headerProps } = useMovementLogic();
  const { sortBy, setSortBy, statusFilter, setStatusFilter } = headerProps;

 // --- ESTADOS DE MODALES SIMPLIFICADOS ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [movementToEdit, setMovementToEdit] = useState(null); // Sigue siendo la clave
    const [movementToView, setMovementToView] = useState(null);
  // --- Hooks de React Query (sin cambios) ---
  const { mutate: applyMovementMutate } = useApplyMovement();
  const { mutate: cancelMovementMutate } = useCancelMovement();
  const { mutate: deleteManualMovementMutate } = useDeleteManualMovement();
  const { mutate: createManualMovementMutate } = useCreateManualMovement();
  const { mutate: updateManualMovementMutate } = useUpdateManualMovement();

   // ===================================================================
  // == 2. HANDLERS Y LÓGICA MEMOIZADA (LIMPIOS)
  // ===================================================================

  const handleApply = async (movementId) => {
    const result = await showConfirmationDialog('¿Aplicar Movimiento?', 'El stock del producto se verá afectado.', 'Sí, aplicar');
    if (result.isConfirmed) {
      applyMovementMutate(movementId, {
        onSuccess: () => showSuccess('¡Movimiento aplicado con éxito!'),
        onError: (err) => showError(err.response?.data?.message || 'Error al aplicar el movimiento.'),
      });
    }
  };

  const handleCancel = async (movementId) => {
    const result = await showConfirmationDialog('¿Anular Movimiento?', 'Esta acción es irreversible.', 'Sí, anular');
    if (result.isConfirmed) {
      cancelMovementMutate(movementId, {
        onSuccess: () => showSuccess('¡Movimiento anulado con éxito!'),
        onError: (err) => showError(err.response?.data?.message || 'Error al anular el movimiento.'),
      });
    }
  };

  const handleDelete = async (movementId) => {
    const result = await showConfirmationDialog('¿Eliminar Movimiento?', 'El movimiento se eliminará permanentemente.', 'Sí, eliminar');
    if (result.isConfirmed) {
      deleteManualMovementMutate(movementId, {
        onSuccess: () => showSuccess('¡Movimiento eliminado con éxito!'),
        onError: (err) => showError(err.response?.data?.message || 'Error al eliminar el movimiento.'),
      });
    }
  };


// 3. NUEVOS HANDLERS PARA EL FLUJO DE EDICIÓN
 // --- Handlers de apertura de modales ---
    const handleOpenCreateModal = () => {
        setMovementToEdit(null); // Aseguramos modo creación
        setIsFormModalOpen(true);
    };
    const handleOpenEditModal = (movement) => {
        setMovementToEdit(movement); // Configuramos modo edición
        setIsFormModalOpen(true);
    };
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
    };

    const handleOpenDetailsModal = (movement) => {
        setMovementToView(movement); // Guarda los datos. ¡Eso es todo!
    };

    const handleCloseDetailsModal = () => {
        setMovementToView(null); // Limpia los datos. ¡Eso es todo!
    };
    const handleStatusFilterClick = (status) => {
        setStatusFilter(prev => prev === status ? null : status);
      };
 // --- UN ÚNICO HANDLER DE GUARDADO ---
  const handleSave = (data) => {
    const isEditing = !!movementToEdit;
    const mutationOptions = {
      onSuccess: () => {
        showSuccess(`¡Movimiento ${isEditing ? 'actualizado' : 'registrado'}!`);
        handleCloseFormModal();
      },
      onError: (err) => showError(err.response?.data?.message || 'Ocurrió un error'),
    };
    if (isEditing) {
      updateManualMovementMutate(data, mutationOptions);
    } else {
      createManualMovementMutate(data, mutationOptions);
    }
  };

  // Definición de columnas de la tabla (conectada a datos reales)
  const columns = useMemo(() => [
    { header: 'Cód. Producto', accessorKey: 'product.productCode' },
    { header: 'Nombre Producto', accessorKey: 'product.productName' },
    { header: 'Fecha', cell: ({ row }) => formatDate(row.original.date) },
    { header: 'Estado', accessorKey: 'status' },
    { header: 'Tipo', accessorKey: 'movementType' },
    { header: 'Cantidad', accessorKey: 'quantity' },
    { header: 'Stock Resultante', accessorKey: 'stockAfterMovement' },
    { header: 'Descripción', accessorKey: 'description' },
    { header: 'Cliente', accessorKey: 'customerName' },
    { header: 'Módulo Origen', accessorKey: 'originModule' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        const movement = row.original;
        const isManual = movement.originModule.includes('Manual');

        return (
          <div className="d-flex gap-2 justify-content-center">
            {isManual && movement.status === 'PENDIENTE' && (
              <>
                <Boton color="morado" title="Editar" onClick={() => handleOpenEditModal(movement)} size="icon">
                  <i className="bi bi-pencil-square"></i>
                </Boton>
                <Boton color="verde" title="Aplicar" onClick={() => handleApply(movement.movementId)} size="icon">
                  <i className="bi bi-check-circle"></i>
                </Boton>
                <Boton color="rojo" title="Eliminar" onClick={() => handleDelete(movement.movementId)} size="icon">
                  <i className="bi bi-trash"></i>
                </Boton>
              </>
            )}

            {isManual && movement.status === 'APLICADA' && (
              <Boton color="rojo" title="Anular" onClick={() => handleCancel(movement.movementId)} size="icon">
                <i className="bi bi-dash-circle"></i>
              </Boton>
            )}

            {movement.status !== 'ANULADA' && (
              <Boton color="blanco" title="Ver Detalles" onClick={() => handleOpenDetailsModal(movement)} size="icon">
                  <i className="bi bi-eye"></i>
              </Boton>
            )}
            
          </div>
        );
      },
    },
  ], [handleApply, handleCancel, handleDelete]);



  if (isLoading) return <p className="text-center">Cargando movimientos...</p>;
  if (isError) return <p className="text-center text-danger">Error: {error.response?.data?.message || error.message}</p>;
  return (
    <>
      <SubMenu />
      <div>
        <h2>Gestión de Movimientos de Inventario</h2>
        <div>
            <Link to="/inventario/movimientosproductos">
                <Boton color="morado" forma="pastilla" className="mb-4" ><i className="bi bi-arrow-left-circle-fill me-2"></i>
                  Regresar
              </Boton>
          </Link>
      </div>

     <SearchCardMovement tamano='tamano-grande' {...searchProps} />
      <div className='contenedor-movimientos'>
        <div className="card-header text-center bg-morado mb-4">
          <h4 className="mb-4">Movimientos de Inventario</h4>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3 px-3">
            {/* --- Lado Izquierdo: Botones de Ordenamiento --- */}
            <div className="d-flex gap-2">
                <Boton color={sortBy === 'status' ? "morado" : "blanco"} forma="pastilla" onClick={() => setSortBy('status')}>
                    Ordenar por Estado
                </Boton>
                <Boton color={sortBy === 'date' ? "morado" : "blanco"} forma="pastilla" onClick={() => setSortBy('date')}>
                    Ordenar por Fecha
                </Boton>
            </div>

            {/* --- Lado Derecho: Botones de Acción y Filtro Rápido --- */}
            <div className="d-flex gap-2 align-items-center">
                <Boton color="morado" forma="pastilla" onClick={handleOpenCreateModal}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar
                </Boton>

                {/* --- BOTONES DE FILTRO RÁPIDO MEJORADOS --- */}
                <div className="vr mx-2"></div> {/* Separador visual opcional */}

                <Boton color={statusFilter === 'PENDIENTE' ? 'blanco' : 'morado'}  forma="pastilla" onClick={() => handleStatusFilterClick('PENDIENTE')}>
                    Pendientes
                </Boton>
                <Boton color={statusFilter === 'APLICADA' ? 'verde' : 'morado'} forma="pastilla" onClick={() => handleStatusFilterClick('APLICADA')}>
                    Aplicados
                </Boton>
                <Boton color={statusFilter === 'ANULADA' ? 'rojo' : 'morado'} forma="pastilla" onClick={() => handleStatusFilterClick('ANULADA')}>
                    Anulados
                </Boton>
            </div>
        </div>
        <TableComponent columns={columns} data={movimientos} withPagination={true} rowProps={(row) => ({
            className:
                row.original.status === 'APLICADA'? 'table-success': row.original.status === 'ANULADA'? 'table-danger' : ''
          })}
        />
        
        {/* ¡EL NUEVO MODAL UNIFICADO EN ACCIÓN! */}
            <MovementFormModal show={isFormModalOpen} onClose={handleCloseFormModal} onSave={handleSave} initialData={movementToEdit} />

        {movementToView && (
            <ViewDetailsMovement show={!!movementToView} onClose={handleCloseDetailsModal} movement={movementToView}/>
        )}
      </div>
    </div>
  </>
  );
};


export default MovementView;