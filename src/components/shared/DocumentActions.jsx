/**
 * DocumentActions.jsx
 * ----------------------------------------------------------------------
 * PROPÓSITO:
 * Componente de presentación puro y reutilizable, responsable de renderizar
 * el conjunto correcto de botones de acción (ej. Editar, Anular, Aprobar)
 * para un documento específico.
 *
 * FUNCIONAMIENTO:
 * Recibe un objeto 'doc' y, basándose en su propiedad 'status' (PENDIENTE,
 * APLICADA, etc.), decide qué acciones son válidas y las muestra.
 * Toda la lógica de los clics y el estado de carga de las mutaciones
 * se recibe a través de props desde un componente padre.
 *
 * REUTILIZACIÓN:
 * Diseñado para ser usado dentro de cualquier fila de tabla que muestre
 * un documento con estados (Ventas, Notas de Crédito, Compras, etc.),
 * centralizando la lógica de qué acciones se permiten en cada estado.
 */

import React from 'react';
import { FaEye, FaPen, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
export const DocumentActions = ({
  doc,
  id,
  onEdit,
  onDelete,
  onApprove,
  onCancel,
  onView,
  isApproving,
  isCancelling,
  isDeleting,
  styles
}) => {
     // 1. Determina propiedades genéricas del documento
  const status = doc.saleStatus || doc.creditNoteStatus;

  // --- FUNCIÓN HELPER PARA BOTONES REPETITIVOS ---
  const renderButton = (title, icon, onClick, isDisabled = false) => (
    <button
      className={styles.actionIconBtn} // Usaremos una nueva clase para evitar conflictos
      title={title}
      onClick={onClick}
      disabled={isDisabled}
    >
      {icon}
    </button>
  );
  if (status === 'PENDIENTE') {
    return (
      <div className={styles.actions}>
        {renderButton("Editar", <FaPen />, () => onEdit(id))}
        {renderButton("Eliminar", <FaTrashAlt />, () => onDelete(id), isDeleting)}
        {renderButton("Aprobar", <FaCheckCircle />, () => onApprove(id), isApproving)}
      </div>
    );
  }

  if (status === 'APLICADA') {
    return (
      <div className={styles.actions}>
        {renderButton("Ver Asiento Contable", <FaEye />, () => onView(doc))}
        {renderButton("Anular", <FaTimesCircle />, () => onCancel(id), isCancelling)}
      </div>
    );
  }

  // Si el estado no es PENDIENTE ni APLICADA, no se renderiza ninguna acción.
  // Esto cubre el caso de 'ANULADA' y cualquier otro estado futuro.

  return null; // No mostrar acciones para otros estados
};