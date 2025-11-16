// src/components/sales/sales/SaleForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { DocumentCustomerInfo } from '../../shared/form/DocumentCustomerInfo';
import { DocumentTotals } from '../../shared/form/DocumentTotals';
// --- IMPORTAMOS LA NUEVA TABLA GENÉRICA ---
import { DetailsTable } from '../../shared/form/DetailsTable';
import { DocumentHeader } from '../../shared/form/DocumentHeader';
import { LineItemEditor } from './form-components/LineItemEditor';
import styles from '../../../styles/shared/DocumentForm.module.css'; // Usa el CSS compartido
import { Notifier } from '../../../utils/alertUtils';

export default function SaleForm(props) {
  // Se desestructuran todas las props recibidas para mayor claridad.
  const {
    title,
    client,
    isLoadingClient,
    productOptions,
    isLoadingProducts,
    isSaving,
    formLogic,
    onFormSubmit,
    submitButtonText
  } = props;

  const navigate = useNavigate(); // <-- Usamos el hook aquí
  // Se desestructuran todas las funciones y datos del hook.
  // Esto asegura que 'register', 'handleSubmit', 'errors', etc., estén definidos en este scope.
  const {
    formMethods,
    fields,
    lineEditor,
    handleEditLine,
    handleDeleteLine
  } = formLogic;

  const { register, control, handleSubmit, watch, formState: { errors } } = formMethods;
  // --- FIN DE LA CORRECCIÓN DEFINITIVA ---
  const onValidationError = (validationErrors) => {
    console.error('Validación de Zod falló (Venta):', validationErrors);
    Notifier.showError('Formulario Incompleto', 'Por favor, revisa todos los campos marcados en rojo.');
  };


  // --- CAMBIO #3 (OPCIONAL pero recomendado) ---
  // Añadimos la confirmación antes de enviar el formulario
  const handleFormSubmit = async (formData) => {
    const result = await Notifier.confirm({
      title: title.includes('Editar') ? '¿Actualizar Venta?' : '¿Registrar Venta?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: title.includes('Editar') ? 'Sí, actualizar' : 'Sí, registrar'
    });

    if (result.isConfirmed) {
      onFormSubmit(formData); // Llama a la función del padre si se confirma
    }
  };
  
  // --- CAMBIO #4 ---
  // Creamos el handler de cancelar aquí, dentro del formulario
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás toda la información ingresada.',
      confirmButtonText: 'Sí, descartar'
    });
    if (result.isConfirmed) {
      navigate('/ventas/ventas');
    }
  };

  // --- LÓGICA DE LA TABLA AHORA VIVE AQUÍ ---
  const tableHeaders = ['Tipo', 'Nombre', 'Código', 'Cantidad', 'Precio', 'Subtotal', 'Imp.', 'Acciones'];

  const renderSaleRow = (field, index) => {
    const nombre = field.productId ? field._productName : field.serviceName;
    const codigo = field.productId ? field._productCode : '';
    // Determinamos si la fila es inválida usando la bandera que pasamos.
    const isRowInvalid = field._isInvalid === true;
    const rowClassName = isRowInvalid ? styles.invalidRow : '';
    return (
      <tr key={field.id} className={rowClassName}>
        <td>{field.productId ? 'Producto' : 'Servicio'}</td>
        <td>{nombre}</td>
        <td>{codigo}</td>
        <td>{field.quantity}</td>
        <td>{field.unitPrice.toFixed(2)}</td>
        <td>{field.subtotal.toFixed(2)}</td>
        <td>{field.impuesto ? '✔' : '✘'}</td>
        <td>
          <button type="button" className={styles.iconBtn} onClick={() => handleEditLine(index, productOptions)} disabled={isRowInvalid} // <-- NUEVO
            title={isRowInvalid ? "No se puede editar un producto desactivado" : "Editar línea"}><FaEdit /></button>
          <button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}><FaTrash /></button>
        </td>
      </tr>
    );
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{props.title}</h1>
      <DocumentCustomerInfo entity={props.client} isLoading={props.isLoadingClient}  />
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
         <DocumentHeader 
          register={register}
          control={control} // <-- AÑADIR ESTA LÍNEA
          errors={errors}
          descriptionFieldName="saleDescription"
        >
           <>
    <label className="form-label">Tipo de Ítem</label>
    <select 
      className="form-select" 
      value={lineEditor.tipo} 
      onChange={e => lineEditor.setTipo(e.target.value)}
    >
      <option value="Producto">Producto</option>
      <option value="Servicio">Servicio</option>
    </select>
  </>
        </DocumentHeader>
        <LineItemEditor
          editor={lineEditor}
          productOptions={productOptions}
          isLoadingProducts={props.isLoadingProducts}
        />
        {/* Usamos la tabla genérica, pasándole los headers y la función de renderizado */}
        <DetailsTable
          fields={fields}
          errors={errors}
          headers={tableHeaders}
          renderRow={renderSaleRow}
        />
        <DocumentTotals
          watch={formMethods.watch}
          isSaving={props.isSaving}
          submitButtonText={props.submitButtonText}
          onCancel={handleCancel} 
        />
      </form>
    </main>
  );
}