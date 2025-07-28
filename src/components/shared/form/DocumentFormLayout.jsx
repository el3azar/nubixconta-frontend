// src/components/shared/form/DocumentFormLayout.jsx
import React from 'react';
import { DocumentCustomerInfo } from './DocumentCustomerInfo';
import { DocumentHeader } from './DocumentHeader';
import { DocumentTotals } from './DocumentTotals';
import styles from '../../../styles/shared/DocumentForm.module.css';

/**
 * Componente "Esqueleto" para el layout de los formularios.
 * NO contiene la etiqueta <form>, solo la estructura visual.
 */
export const DocumentFormLayout = (props) => {
  const {
    title,
    client,
    isLoadingClient,
    formLogic,
    headerContent,
    children, // Contenido específico del formulario (editor, tabla)
    ...totalProps // Props para DocumentTotals (onCancel, isSaving, etc.)
  } = props;

  const { formMethods: { register, watch, formState: { errors } } } = formLogic;

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <DocumentCustomerInfo client={client} isLoading={isLoadingClient} />
      
      <DocumentHeader register={register} errors={errors}>
        {headerContent}
      </DocumentHeader>
      
      {children}
      
      <DocumentTotals watch={watch} {...totalProps} />
    </main>
  );
};