// src/components/credit-notes/form-components/CreditNoteForm.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useWatch } from 'react-hook-form';
import styles from '../../../styles/sales/NewCreditNote.module.css';

// Componente interno para los totales
const DocumentTotals = ({ control }) => {
// 1. 'useWatch' puede devolver 'undefined' en el primer render.
  const [subtotalAmount, vatAmount, totalAmount] = useWatch({
    control,
    name: ['subtotalAmount', 'vatAmount', 'totalAmount']
  });

  const safeSubtotal = subtotalAmount || 0;
  const safeVat = vatAmount || 0;
  const safeTotal = totalAmount || 0;

  return (
   <div className={styles.totalsRow}>
      <div>
        <strong>Subtotal:</strong>
        <span>${(subtotalAmount || 0).toFixed(2)}</span>
      </div>
      <div>
        <strong>IVA (13%):</strong>
        <span>${(vatAmount || 0).toFixed(2)}</span>
      </div>
      <div>
        <strong>Total:</strong>
        <span>${(totalAmount || 0).toFixed(2)}</span>
      </div>
    </div>
  );
};

export const CreditNoteForm = ({
    customer,
  formMethods,
  fields,
  remove,
  onCancel,
  isSaving,
  onSubmit, 
  submitButtonText
}) => {

  if (!customer) {
    return (
      <section className={styles.clienteSection}>
        <h3>Información del Cliente</h3>
        <p>Cargando datos del cliente...</p>
      </section>
    );
  }
  
  const { register, handleSubmit, control, formState: { errors } } = formMethods;
  // Esto nos dará una copia en tiempo real de los datos del formulario.
  const watchedDetails = useWatch({
    control,
    name: 'details'
  });

  const handleDelete = (index) => {
    Swal.fire({
      title: '¿Eliminar este detalle?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        remove(index);
        Swal.fire('Eliminado', 'El detalle ha sido eliminado.', 'success');
      }
    });
  };
  
  const customerFields = {
    'Nombre': customer.customerName, 'NRC': customer.ncr, 'DUI': customer.customerDui,
    'NIT': customer.customerNit, 'Días de Crédito': customer.creditDay, 'Correo': customer.email,
    'Teléfono': customer.phone, 'Actividad': customer.businessActivity,
  };

   // Se ejecutará si y solo si la validación de Zod falla.
  const onValidationError = (validationErrors) => {
    console.error("❌ Validación de Zod falló. Errores:", validationErrors);
    Swal.fire(
      'Formulario Incompleto',
      'Por favor, revisa que todos los campos requeridos (como N° de Documento y Descripción) estén llenos.',
      'warning'
    );
  };


  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
      {/* Sección Encabezado del Documento */}
      <section className={styles.documentSection}>
        <div className={styles.documentGrid}>
          <div className={styles.documentField}>
            <label>N° de Documento de la Nota de Crédito</label>
            <input type="text" {...register('documentNumber')} />
            {errors.documentNumber && <small style={{ color: 'red' }}>{errors.documentNumber.message}</small>}
          </div>
          <div className={styles.documentField}>
            <label>Fecha de Emisión</label>
            <input type="text" value={new Date().toLocaleDateString()} readOnly />
          </div>
          <div className={styles.documentField} style={{ marginTop: '1rem' }}>
          <label>Descripción</label>
          <input type='text'
            {...register('description')} 
            rows="1"
            
          ></input>
          {errors.description && <small style={{ color: 'red' }}>{errors.description.message}</small>}
        </div>
        </div>
      </section>

      {/* Sección Información Cliente */}
      <section className={styles.clienteSection}>
        <h3>Información del Cliente</h3>
        <div className={styles.grid2}>
          {Object.entries(customerFields).map(([label, value]) => (
            <label key={label}>{label}<input type="text" value={value || ''} readOnly /></label>
          ))}
        </div>
      </section>

      {/* Sección Detalles de la Nota de Crédito */}
      <section className={styles.detallesSection}>
        <h3>Detalles para Nota de Crédito (Puedes editar cantidad, precio e impuesto)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre Producto</th>
              <th>Nombre Servicio</th>
              <th>Código</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>Impuesto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center' }}>Seleccione una venta para ver sus detalles</td></tr>
            ) : (
              fields.map((field, index) => {
                // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
                // Definimos las variables ANTES de usarlas en el return del JSX.
              const currentItem = (watchedDetails && watchedDetails[index]) ? watchedDetails[index] : {};
              const quantity = currentItem.quantity || 0;
              const unitPrice = currentItem.unitPrice || 0;
              const subtotal = quantity * unitPrice;
                return (
                  <tr key={field.id}>
                    <td>{field.product ? 'Producto' : 'Servicio'}</td>
                    <td>{field.product?.productName || ''}</td>
                    <td>{field.serviceName || ''}</td>
                    <td>{field.product?.productCode || 'N/A'}</td>
                    <td><input type="number" min="0" className={styles.editableInput} {...register(`details.${index}.quantity`, { valueAsNumber: true })} /></td>
                    <td><input type="number" min="0" step="0.01" className={styles.editableInput} {...register(`details.${index}.unitPrice`, { valueAsNumber: true })} /></td>
                    {/* Ahora la variable 'subtotal' SÍ existe */}
                    <td>${subtotal.toFixed(2)}</td>
                   
                    <td style={{ textAlign: 'center' }}>
                      {/* Envolvemos todo en una label para la accesibilidad y el click */}
                      <label className={styles.customCheckboxContainer}>
                        {/* El input real se ocultará con CSS, pero sigue manejando el estado */}
                        <input type="checkbox" {...register(`details.${index}.impuesto`)} />
                        {/* Este span será nuestro checkbox visual personalizado */}
                        <span className={styles.checkmark}></span>
                      </label>
                    </td>
                    <td><button type="button" title="Eliminar" onClick={() => handleDelete(index)}><FaTrash /></button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {errors.details && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{errors.details.message || errors.details.root?.message}</p>}
      </section>

      
       <div className={styles.footerActions}>
        <DocumentTotals control={control} />
        
        <div className={styles.actions}>
        <button type="submit" className={styles.actionButton} disabled={isSaving}>
          {isSaving ? 'Guardando...' : submitButtonText}
        </button>
        <button type="button" className={styles.actionButton} onClick={onCancel}>
          Cancelar
        </button>
      </div>
      </div>

      
    </form>
  );
};