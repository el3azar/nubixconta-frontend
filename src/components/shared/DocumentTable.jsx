/**
 * DocumentTable.jsx
 * ----------------------------------------------------------------------
 * PROPÓSITO:
 * Componente de presentación reutilizable que se encarga de renderizar el
 * cuerpo (tbody) de la tabla de documentos.
 *
 * FUNCIONAMIENTO:
 * Centraliza la lógica de los estados de la petición de datos. Muestra
 * mensajes de "Cargando...", "Error al cargar datos" o "No hay documentos"
 * según las props que recibe (isLoading, isError, documents).
 *
 * Si hay documentos, mapea sobre la lista y delega la renderización de
 * cada fila individual a un componente hijo (DocumentTableRow), pasándole
*  los datos y las props de acciones necesarias.
 *
 * REUTILIZACIÓN:
 * Permite mantener una apariencia y comportamiento consistentes para todas
 * las tablas de la aplicación, desacoplando la lógica de la tabla de la
 * lógica de la página principal.
 */


import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter';

const DocumentTableRow = ({ doc, actionsProps, styles,documentType }) => {
  // Lógica para normalizar el acceso a los datos
  const status = doc.creditNoteStatus || doc.saleStatus;
  const issueDate = doc.creditNoteDate || doc.issueDate;
  const description = doc.description || doc.saleDescription;
  const id = doc.idNotaCredit || doc.saleId;
  
  // ¡LA CLAVE ESTÁ AQUÍ! Accedemos al cliente de forma condicional.
  // Si es una Venta, doc.customer existe.
  // Si es una NC, accedemos a través de doc.sale.customer.
  const customer = doc.customer || doc.sale?.customer;

  const rowClass = status === 'APLICADA' ? 'table-success' : 
                   status === 'ANULADA' ? 'table-danger' : '';

  return (
    <tr className={rowClass}>
      <td>{id}</td>
      <td>{doc.documentNumber}</td>
      <td>{formatDate(issueDate)}</td>
      <td>{status}</td>
      <td>{customer?.customerName || 'N/A'}</td>
      <td>{customer?.creditDay || '-'}</td>
      {/* --- INICIO DEL CAMBIO --- */}
      {/* Renderizado condicional para la celda de datos extra */}
      {documentType === 'Nota de Crédito' && (
        <td>
          {/* Mostramos el N° de documento de la venta asociada */}
          {doc.sale?.documentNumber || 'N/A'}
        </td>
      )}
      {/* --- FIN DEL CAMBIO --- */}
      <td>{description}</td>
      <td>${doc.totalAmount?.toFixed(2)}</td>
      <td className="text-center">
        <DocumentActions doc={doc} id={id} styles={styles} {...actionsProps} />
      </td>
    </tr>
  );
};

export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, documentType  }) => {
  if (isLoading) return <tr><td colSpan="9" className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan="9" className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (documents.length === 0) return <tr><td colSpan="9" className="text-center">No hay documentos para mostrar.</td></tr>;

  return documents.map(doc => <DocumentTableRow key={doc.idNotaCredit || doc.saleId} doc={doc} actionsProps={actionsProps} styles={styles} documentType={documentType} />);
};