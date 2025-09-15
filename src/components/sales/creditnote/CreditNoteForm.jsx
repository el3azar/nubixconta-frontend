// src/components/sales/creditnote/CreditNoteForm.jsx
import React from 'react';
import { Notifier } from '../../../utils/alertUtils';
import { FaTrash } from 'react-icons/fa';
import { useWatch } from 'react-hook-form';
import { DocumentCustomerInfo } from '../../shared/form/DocumentCustomerInfo';
import { DocumentTotals } from '../../shared/form/DocumentTotals';
// --- IMPORTAMOS LA NUEVA TABLA GENÉRICA ---
import { DetailsTable } from '../../shared/form/DetailsTable';
import styles from '../../../styles/shared/DocumentForm.module.css'; // Usa el CSS compartido
import TextareaAutosize from 'react-textarea-autosize';

export default function CreditNoteForm(props) {
   const {
    title,
    customer,
    formMethods,
    fields,
    remove,
    onCancel,
    isSaving,
    onSubmit, // Se lee la prop correcta 'onSubmit'
    submitButtonText
  } = props;
  const { register, handleSubmit, control, formState: { errors } } = formMethods;

  const watchedDetails = useWatch({ control, name: 'details' });

   // --- ¡AQUÍ VA LA NUEVA LÓGICA DE CONFIRMACIÓN! ---
  const handleFormSubmit = async (formData) => {
    const isEditMode = title.toLowerCase().includes('editar');
    
    const result = await Notifier.confirm({
      title: isEditMode ? '¿Actualizar Nota de Crédito?' : '¿Registrar Nota de Crédito?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });

    if (result.isConfirmed) {
      // Si el usuario confirma, llamamos a la función 'onSubmit' que viene de las props.
      onSubmit(formData);
    }
  };

  const onValidationError = (errors) => {
    console.error('❌ Validación de Zod falló (NC):', errors);
    Notifier.showError('Formulario Incompleto', 'Por favor, revisa todos los campos.');
  };

  // --- LÓGICA DE LA TABLA AHORA VIVE AQUÍ ---
  const tableHeaders = ['Tipo', 'Nombre', 'Código', 'Cantidad', 'Precio', 'Subtotal', 'Imp.', 'Acciones'];

   // --- CAMBIO #3: Refactorizamos la alerta de eliminación de línea ---
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

  
  const renderCreditNoteRow = (field, index) => {
    const currentItem = watchedDetails?.[index] || {};
    const subtotal = (currentItem.quantity || 0) * (currentItem.unitPrice || 0);
    return (
      <tr key={field.id}>
        <td>{field.product ? 'Producto' : 'Servicio'}</td>
        <td>{field.product?.productName || field.serviceName || ''}</td>
        <td>{field.product?.productCode || 'N/A'}</td>
        <td><input type="number" min="0" className={styles.editableInput} {...register(`details.${index}.quantity`, { valueAsNumber: true })} /></td>
        <td><input type="number" min="0" step="0.01" className={styles.editableInput} {...register(`details.${index}.unitPrice`, { valueAsNumber: true })} /></td>
        <td>${subtotal.toFixed(2)}</td>
        <td style={{ textAlign: 'center' }}>
          <label className={styles.customCheckboxContainer}>
            <input type="checkbox" {...register(`details.${index}.impuesto`)} />
            <span className={styles.checkmark}></span>
          </label>
        </td>
       <td><button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}><FaTrash /></button></td>
      </tr>
    );
  };

  return (
    <>
       <DocumentCustomerInfo client={customer} />
      {/* Se usa la prop 'onSubmit' que ahora sí está definida y es una función */}
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
        <section className={styles.card}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-4 ">
              <label className="form-label">N° de Documento</label>
              <input className="form-control" {...register('documentNumber')} />
              {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label">Fecha de Emisión</label>
              <input className="form-control" type="date" {...register('issueDate')} readOnly />
              {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label">Descripción</label>
              <TextareaAutosize  minRows={1} maxRows={3} {...register('description')} />
              {errors.description && <small className='text-danger'>{errors.description.message}</small>}
            </div>
          </div>
        </section>

        <DetailsTable
          fields={fields}
          errors={errors}
          headers={tableHeaders}
          renderRow={renderCreditNoteRow}
        />
        
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