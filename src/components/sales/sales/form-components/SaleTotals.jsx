import React from 'react';
import styles from '../../../../styles/sales/SaleForm.module.css';

/**
 * Componente de presentación para los totales y los botones de acción del formulario.
 */
export const SaleTotals = ({ watch, isSaving, submitButtonText, onCancel }) => {
  // Obtenemos los valores directamente del 'watch' de react-hook-form 
  // para que se actualicen en tiempo real en la UI.
  const subtotal = watch('subtotalAmount') || 0;
  const vat = watch('vatAmount') || 0;
  const total = watch('totalAmount') || 0;

  return (
    <div className="d-flex flex-wrap flex-md-nowrap justify-content-end align-items-center mt-4 gap-3">
      {/* Sección de Totales */}
      <div className={`${styles.total} ms-md-auto`}>
        <span className="fw-normal">Subtotal:</span> <span className="fw-bold">${subtotal.toFixed(2)}</span>
        <span className="fw-normal ms-4">IVA:</span> <span className="fw-bold">${vat.toFixed(2)}</span>
        <span className="fw-normal ms-4">Total:</span> <span className="fw-bold">${total.toFixed(2)}</span>
      </div>
      
      {/* Sección de Botones de Acción */}
      <div>
        <button 
          type="submit" 
          className={`${styles.actionButton} me-3`} 
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : submitButtonText}
        </button>
        <button 
          type="button" 
          className={`${styles.actionButton} ${styles.secondary}`} 
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};