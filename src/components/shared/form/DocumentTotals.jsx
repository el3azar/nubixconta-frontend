import React from 'react';
import styles from '../../../styles/shared/DocumentForm.module.css';

export const DocumentTotals = ({ watch, isSaving, submitButtonText, onCancel }) => {
  const subtotal = watch('subtotalAmount') || 0;
  const vat = watch('vatAmount') || 0;
  const total = watch('totalAmount') || 0;

  return (
    <div className={styles.footerActions}>
      <div className={styles.totalsRow}>
        <strong>Subtotal:</strong><span>${subtotal.toFixed(2)}</span>
        <strong>IVA:</strong><span>${vat.toFixed(2)}</span>
        <strong>Total:</strong><span>${total.toFixed(2)}</span>
      </div>
     {/* --- INICIO DE LA MODIFICACIÓN --- */}
      {/* Se añade el div con la nueva clase */}
      <div className={styles.actionButtonsContainer}>
        <button type="submit" className={styles.actionButton} disabled={isSaving}>
          {isSaving ? 'Guardando...' : submitButtonText}
        </button>
        <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={onCancel}>
          Cancelar
        </button>
      </div>
      {/* --- FIN DE LA MODIFICACIÓN --- */}
    </div>
  );
};