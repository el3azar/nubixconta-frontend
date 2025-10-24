// src/components/purchases/incometax/IncomeTaxForm.jsx

import React from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../../../styles/shared/DocumentForm.module.css';
import { DocumentCustomerInfo } from '../../shared/form/DocumentCustomerInfo';
import TextareaAutosize from 'react-textarea-autosize';
import { Notifier } from '../../../utils/alertUtils'; // Importamos Notifier

const PurchaseDetails = ({ purchase }) => {
  if (!purchase) return null;
  return (
    <section className={styles.card}>
      <h5 className="mb-3">Detalles de la Compra Asociada (No editable)</h5>
      <div className="row g-3">
        <div className="col-12 col-md-4"><label className="form-label">Subtotal</label><input className="form-control" value={`$${Number(purchase.subtotalAmount || 0).toFixed(2)}`} readOnly /></div>
        <div className="col-12 col-md-4"><label className="form-label">IVA</label><input className="form-control" value={`$${Number(purchase.vatAmount || 0).toFixed(2)}`} readOnly /></div>
        <div className="col-12 col-md-4"><label className="form-label">Total</label><input className="form-control" value={`$${Number(purchase.totalAmount || 0).toFixed(2)}`} readOnly /></div>
      </div>
    </section>
  );
};

export const IncomeTaxForm = (props) => {
  const { supplierData, isLoadingSupplier, selectedPurchase, onFormSubmit, isSaving, onCancel, isEditMode = false } = props;
  const { handleSubmit, register, formState: { errors } } = useFormContext();

  // --- CAMBIO CLAVE #1: Manejador de envío con alerta de confirmación ---
  const handleFormSubmit = async (formData) => {
    const result = await Notifier.confirm({
      title: isEditMode ? '¿Actualizar Retención ISR?' : '¿Registrar Retención ISR?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });
    if (result.isConfirmed) {
      onFormSubmit(formData);
    }
  };
  
  // --- CAMBIO CLAVE #2: Manejador para errores de validación ---
  const onValidationError = (validationErrors) => {
    console.error('Errores de validación:', validationErrors);
    Notifier.error('Formulario incompleto. Por favor, revisa los campos marcados.');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)} className={isEditMode ? '' : styles.formContinuation}>
      {!isEditMode && (
        <>
          <hr className={styles.formSeparator} />
          <h3 className={styles.stepTitle}>Paso 2: Completar los datos de la Retención</h3>
        </>
      )}
      
      <DocumentCustomerInfo entity={supplierData} isLoading={isLoadingSupplier} />
      <PurchaseDetails purchase={selectedPurchase} />

      <section className={styles.card}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">N° de Documento</label>
            <input className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`} {...register('documentNumber')} />
            {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Fecha</label>
            {/* --- CAMBIO CLAVE #3: Eliminado 'readOnly={isEditMode}' --- */}
            <input className={`form-control ${errors.issueDate ? 'is-invalid' : ''}`} type="date" {...register('issueDate')} />
            {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Descripción</label>
            <TextareaAutosize
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              minRows={1}
              maxRows={3}
              {...register('description')}
            />
            {errors.description && <small className='text-danger'>{errors.description.message}</small>}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h5 className="mb-3">Monto del Impuesto sobre la Renta</h5>
        <div className="row justify-content-center">
            <div className="col-12 col-md-6">
                <label className="form-label fw-bold">Ingrese cantidad a aplicar:</label>
                <input 
                    type="number"
                    step="0.01"
                    className="form-control form-control-lg text-center" 
                    {...register('amountIncomeTax')} 
                />
                {errors.amountIncomeTax && <small className='text-danger d-block text-center mt-2'>{errors.amountIncomeTax.message}</small>}
            </div>
        </div>
      </section>

      <div className={styles.footerActions}>
        <div className={styles.actionButtonsContainer}>
          <button type="submit" className={styles.actionButton} disabled={isSaving}>
            {isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar ISR' : 'Registrar ISR')}
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={onCancel} disabled={isSaving}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
};