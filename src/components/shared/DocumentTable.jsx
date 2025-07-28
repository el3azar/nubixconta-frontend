// src/components/shared/DocumentTable.jsx

import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter';

const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions }) => {
  // La lógica para el estilo de la fila y las acciones aún necesita saber el estado.
  const status = doc.creditNoteStatus || doc.saleStatus;
  const id = doc.idNotaCredit || doc.saleId;

  // Las clases de color se mantienen igual.
 const rowClass = showRowActions
    ? (status === 'APLICADA' ? 'table-success' : status === 'ANULADA' ? 'table-danger' : '')
    : undefined;

  return (
    <tr className={rowClass}>
      {/* 1. Renderiza dinámicamente cada celda según la configuración */}
      {columns.map((col) => (
        <td key={col.header}>
          {/* 
            2. Usa una función de renderizado `cell` si se proporciona (para formato o datos anidados).
               Si no, accede directamente a la propiedad del objeto usando `accessor`.
          */}
          {col.cell ? col.cell(doc) : doc[col.accessor]}
        </td>
      ))}
        {/* Solo renderizamos la celda de acciones si 'showRowActions' es true */}
      {showRowActions && (
        <td className="text-center">
          <DocumentActions doc={doc} id={id} styles={styles} {...actionsProps} />
        </td>
      )}
    </tr>
  );
};

export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, columns,showRowActions, emptyMessage }) => {
  // El colSpan ahora es dinámico, basado en el número de columnas + la columna de acciones.
  const colSpan = columns.length + (showRowActions ? 1 : 0);

  if (isLoading) return <tr><td colSpan={colSpan} className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan={colSpan} className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (!documents || documents.length === 0) return <tr><td colSpan={colSpan} className="text-center">{emptyMessage}</td></tr>;

  return documents.map(doc => (
    <DocumentTableRow
      key={doc.idNotaCredit || doc.saleId}
      doc={doc}
      columns={columns}
      actionsProps={actionsProps}
      styles={styles}
      showRowActions={showRowActions} 
    />
  ));
};