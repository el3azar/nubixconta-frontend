// src/components/shared/DocumentTable.jsx

import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter';

// --- CAMBIO 1: DocumentTableRow AHORA ACEPTA 'index' ---
const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions, index }) => {
  const status = doc.creditNoteStatus || doc.saleStatus || doc.purchaseStatus || doc.incomeTaxStatus;;
  
  const rowClass = showRowActions
    ? (status === 'APLICADA' ? 'table-success' : status === 'ANULADA' ? 'table-danger' : '')
    : undefined;

  return (
    // <tr> no necesita 'key' aquí, la 'key' va en el .map() de DocumentTable
    <tr className={rowClass}>
      {columns.map((col) => (
        <td key={col.header} style={col.style || {}} className={col.className || styles.textAlignCenter}>
          {/* --- CAMBIO 2: PASAMOS EL 'index' A LA FUNCIÓN 'cell' ---
            Esto es crucial para que tu botón de borrar funcione.
          */}
          {col.cell ? col.cell(doc, index) : doc[col.accessor]}
        </td>
      ))}
      {showRowActions && (
        <td className="text-center">
          <DocumentActions doc={doc} styles={styles} {...actionsProps} />
        </td>
      )}
    </tr>
  );
};

export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, columns, showRowActions, emptyMessage }) => {
  const colSpan = columns.length + (showRowActions ? 1 : 0);

  if (isLoading) return <tr><td colSpan={colSpan} className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan={colSpan} className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (!documents || documents.length === 0) return <tr><td colSpan={colSpan} className="text-center">{emptyMessage}</td></tr>;

  // --- CAMBIO 3: EL .map() AHORA PASA EL 'index' Y USA EL 'index' COMO FALLBACK KEY ---
  return documents.map((doc, index) => (
    <DocumentTableRow
      key={doc.idPurchase || doc.idNotaCredit || doc.saleId || doc.idPurchaseCreditNote || doc.idIncomeTax || doc.idBankTransaction || doc.idBankEntry || index}
      doc={doc}
      index={index} // Pasamos el 'index' como prop
      columns={columns}
      actionsProps={actionsProps}
      styles={styles}
      showRowActions={showRowActions} 
    />
  ));
};