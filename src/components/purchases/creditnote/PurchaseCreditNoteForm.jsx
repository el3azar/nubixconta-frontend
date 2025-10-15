// src/components/purchases/creditnote/PurchaseCreditNoteForm.jsx

import React from 'react';
import { useWatch } from 'react-hook-form';
import { Notifier } from '../../../utils/alertUtils';
import { DocumentCustomerInfo } from '../../shared/form/DocumentCustomerInfo';
import { DocumentTotals } from '../../shared/form/DocumentTotals';
import { DetailsTable } from '../../shared/form/DetailsTable';
import TextareaAutosize from 'react-textarea-autosize';
import styles from '../../../styles/shared/DocumentForm.module.css';
import { FaTrash } from 'react-icons/fa';

/**
 * Componente presentacional para el formulario de Nota de Crédito sobre Compras.
 * Recibe toda la lógica a través de props.
 */
export default function PurchaseCreditNoteForm(props) {
  const {
    supplier,
    isLoadingSupplier,
    formLogic,
    isSaving,
    onSubmit,
    onCancel,
    isEditMode = false,
    submitButtonText
  } = props;

   // Obtenemos 'remove' del hook para poder eliminar filas.
  const { formMethods, fields, remove } = formLogic; 
  const { register, handleSubmit, control, formState: { errors } } = formMethods;
  const watchedDetails = useWatch({ control, name: 'details' });


 // Modificamos handleFormSubmit para que use 'isEditMode' en lugar de 'title.includes()'
  const handleFormSubmit = async (formData) => {
    const result = await Notifier.confirm({
      // Usamos la variable booleana 'isEditMode' para decidir el texto.
      title: isEditMode ? '¿Actualizar Nota de Crédito?' : '¿Registrar Nota de Crédito?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });
    if (result.isConfirmed) {
      onSubmit(formData);
    }
  };

  const onValidationError = (validationErrors) => {
    console.error('❌ Validación de Zod falló (NC Compra):', validationErrors);
    Notifier.showError('Formulario Incompleto', 'Por favor, revisa todos los campos marcados en rojo.');
  };

  // --- LÓGICA DE ELIMINACIÓN DE LÍNEA (COMO EN VENTAS) ---
  const handleDeleteLine = async (index) => {
    const result = await Notifier.confirm({
      title: '¿Eliminar este detalle?',
      text: 'No podrás revertir esta acción.',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
      remove(index);
      Notifier.success('El detalle ha sido eliminado.');
    }
  };

  // --- CABECERAS DE TABLA ACTUALIZADAS ---
  const tableHeaders = ['Tipo', 'Descripción', 'Código', 'Cantidad', 'Precio', 'Subtotal', 'IVA', 'Acciones'];

  /**
   * Renderiza una única fila de la tabla de detalles.
   * @param {object} field - El objeto del campo del array de react-hook-form.
   * @param {number} index - El índice del campo en el array.
   */
  // --- RENDERIZADO DE FILA ACTUALIZADO ---
  const renderDetailRow = (field, index) => {
    const currentItem = watchedDetails?.[index] || {};
    const subtotal = (currentItem.quantity || 0) * (currentItem.unitPrice || 0);
    
    return (
      <tr key={field.id}>
        <td>{field.productId ? 'Producto' : 'Cuenta'}</td>
        <td>{field._displayName}</td>
        <td>{field._displayCode}</td>
        {/* Cantidad ahora es un input editable */}
        <td>
          <input
            type="number"
            min="0"
            className={styles.editableInput}
            {...register(`details.${index}.quantity`, { valueAsNumber: true })}
          />
        </td>
        {/* Precio ahora es un input editable */}
        <td>
          <input
            type="number"
            min="0"
            step="0.01"
            className={styles.editableInput}
            {...register(`details.${index}.unitPrice`, { valueAsNumber: true })}
          />
        </td>
        <td className="text-end">${subtotal.toFixed(2)}</td>
        {/* IVA (Impuesto) ahora es un checkbox editable */}
        <td style={{ textAlign: 'center' }}>
          <label className={styles.customCheckboxContainer}>
            <input type="checkbox" {...register(`details.${index}.tax`)} />
            <span className={styles.checkmark}></span>
          </label>
        </td>
        {/* Acciones para eliminar la fila */}
        <td>
          <button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}>
            <FaTrash />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Muestra la información del proveedor. */}
      <DocumentCustomerInfo entity={supplier} isLoading={isLoadingSupplier} />

      {/* El `onSubmit` del formulario llama a nuestro wrapper con confirmación. */}
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
        <section className={styles.card}>
          <div className="row g-3 align-items-center">
            {/* Campo N° de Documento */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-bold">N° de Documento</label>
              <input className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`} {...register('documentNumber')} />
              {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
            </div>

            {/* Campo Fecha de Emisión */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-bold">Fecha de Emisión</label>
              <input className={`form-control ${errors.issueDate ? 'is-invalid' : ''}`} type="date" {...register('issueDate')} readOnly={isEditMode} />
              {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
            </div>

            {/* Campo Descripción */}
            {/* La única diferencia es que en ventas, este campo también tiene col-md-6, lo ajustamos */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-bold">Descripción</label>
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

        {/* Componente reutilizable para la tabla de detalles. */}
        <DetailsTable
          fields={fields}
          errors={errors.details}
          headers={tableHeaders}
          renderRow={renderDetailRow}
          emptyMessage="Seleccione una compra para ver sus detalles."
        />

        {/* Componente reutilizable para los totales y botones de acción. */}
        <DocumentTotals
          watch={formMethods.watch}
          isSaving={isSaving}
          submitButtonText={submitButtonText}
          onCancel={onCancel}
        />
      </form>
    </>
  );
}