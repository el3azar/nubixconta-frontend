// src/components/shared/DocumentTable.jsx

import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter';

// 1. Añade 'disableGenericActions' a la lista de props que recibe la fila
const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions, disableGenericActions }) => {
  const status = doc.status || doc.creditNoteStatus || doc.saleStatus;
  const id = doc.id || doc.idNotaCredit || doc.saleId;

  const rowClass = showRowActions
    ? (status === 'APLICADA' ? 'table-success' : status === 'ANULADA' ? 'table-danger' : '')
    : undefined;

  return (
    <tr className={rowClass}>
      {/* Esto sigue igual, renderiza las columnas que le pasas */}
      {columns.map((col) => (
        <td key={col.header} style={col.style || {}} className={col.className || styles.textAlignCenter}>
          {col.cell ? col.cell(doc) : doc[col.accessor]}
        </td>
      ))}

      {/* 2. AQUÍ ESTÁ LA LÓGICA CLAVE: */}
      {/* Solo muestra las acciones genéricas si showRowActions es true Y si disableGenericActions NO es true */}
      {showRowActions && !disableGenericActions && (
        <td className="text-center">
          <DocumentActions doc={doc} id={id} styles={styles} {...actionsProps} />
        </td>
      )}
    </tr>
  );
};

// 3. Añade 'disableGenericActions' a la lista de props de la tabla principal
export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, columns, showRowActions, emptyMessage, disableGenericActions }) => {
  
  // El colSpan ahora debe tener en cuenta si se mostrará la columna genérica o no
  const colSpan = columns.length + (showRowActions && !disableGenericActions ? 1 : 0);

  if (isLoading) return <tr><td colSpan={colSpan} className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan={colSpan} className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (!documents || documents.length === 0) return <tr><td colSpan={colSpan} className="text-center">{emptyMessage}</td></tr>;

  return documents.map(doc => (
    <DocumentTableRow
      key={doc.id || doc.idNotaCredit || doc.saleId}
      doc={doc}
      columns={columns}
      actionsProps={actionsProps}
      styles={styles}
      showRowActions={showRowActions}
      // 4. Pasa la nueva prop hacia abajo al componente de la fila
      disableGenericActions={disableGenericActions}
    />
  ));
};