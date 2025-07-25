import React from 'react';
import { SaleCustomerInfo } from './form-components/SaleCustomerInfo';
import { SaleDocumentHeader } from './form-components/SaleDocumentHeader';
import { LineItemEditor } from './form-components/LineItemEditor';
import { SaleDetailsTable } from './form-components/SaleDetailsTable';
import { SaleTotals } from './form-components/SaleTotals';
import styles from '../../../styles/sales/SaleForm.module.css';

/**
 * Componente "Ensamblador" del formulario de Ventas.
 * Recibe toda la lógica desde su padre (NewSale/EditSale) a través de props
 * y la distribuye entre los sub-componentes de presentación.
 * Su estructura es la maqueta visual del formulario.
 */
export default function SaleForm({
  title,
  client,
  isLoadingClient,
  productOptions,
  isLoadingProducts,
  isSaving,
  formLogic,
  onFormSubmit,
  onCancel,
  submitButtonText = 'Registrar'
}) {
  
  // Extraemos las partes necesarias del objeto formLogic para mayor claridad.
  const {
    formMethods: { register, handleSubmit, watch, formState: { errors } },
    fields,
    lineEditor,
    handleDeleteLine,
    handleEditLine,
  } = formLogic;

  return (
    <main className={`${styles.container} container-lg`}>
      <h1 className={`${styles.title} text-center mb-4`}>{title}</h1>

      <SaleCustomerInfo client={client} isLoading={isLoadingClient} />

      <form onSubmit={handleSubmit(onFormSubmit)}>
        
        <SaleDocumentHeader
          register={register}
          errors={errors}
          editorTipo={lineEditor.tipo}
          setEditorTipo={lineEditor.setTipo}
        />

        <LineItemEditor
          editor={lineEditor}
          productOptions={productOptions}
          isLoadingProducts={isLoadingProducts}
        />
        
        <SaleDetailsTable
          fields={fields}
          productOptions={productOptions}
          onEdit={(index) => handleEditLine(index, productOptions)}
          onDelete={handleDeleteLine}
          errors={errors}
        />

        <SaleTotals
          watch={watch}
          isSaving={isSaving}
          submitButtonText={submitButtonText}
          onCancel={onCancel}
        />
      </form>
    </main>
  );
}