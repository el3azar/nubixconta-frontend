// src/components/shared/DocumentTable.jsx

import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter';

// Aceptar 'index' como prop
const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions, index }) => {
  // La lógica para el estilo de la fila y las acciones aún necesita saber el estado.
  // Asegúrate de que los accesores de estado existan en tus documentos.
  const status = doc.creditNoteStatus || doc.saleStatus || doc.purchaseStatus || doc.status; // Añadido doc.status para Este Modulo
  const id = doc.idPurchase || doc.idNotaCredit || doc.saleId || doc.id; // Añadido doc.id

  const rowClass = showRowActions
    ? (status === 'APLICADA' ? 'table-success' : status === 'ANULADA' ? 'table-danger' : '')
    : undefined;

  return (
    // La key ya no va en el <tr> aquí, sino en el .map() de DocumentTable
    <tr className={rowClass}>
      {columns.map((col) => {
        let cellContent;
        // Manejo de accessor anidado para 'collection.moduleType' y 'collection.reference'
        if (col.accessor && col.accessor.includes('.')) {
          const parts = col.accessor.split('.');
          let current = doc;
          for (let i = 0; i < parts.length; i++) {
            current = current ? current[parts[i]] : undefined;
            if (current === undefined) break;
          }
          cellContent = current;
        } else {
          cellContent = doc[col.accessor];
        }

        // Si col.cell está definido, úsalo. Este es el punto principal de la extensión.
        if (col.cell) {
          cellContent = col.cell(doc, index); // Pasa `doc` y `index` a la función `cell`
        } else if (col.accessor === 'amount' || col.accessor === 'debit' || col.accessor === 'credit') {
          const num = typeof cellContent === 'number' ? cellContent : 0;
          cellContent = `$${num.toFixed(2)}`;
        } else if (col.accessor === 'transactionDate' || col.accessor === 'date') {
          cellContent = formatDate(cellContent);
        }

        return (
          // Usar una key única para cada celda
          <td key={`${id || index}-${col.accessor}`} style={col.style || {}} className={col.className || styles.textAlignCenter}>
            {cellContent ?? ''}
          </td>
        );
      })}
      {showRowActions && (
        <td key={`${id || index}-actions`} className="text-center">
          <DocumentActions doc={doc} styles={styles} {...actionsProps} />
        </td>
      )}
    </tr>
  );
};

export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, columns, showRowActions, emptyMessage, renderActionsCell }) => {
  const colSpan = columns.length + (showRowActions ? 1 : 0);

  if (isLoading) return <tr><td colSpan={colSpan} className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan={colSpan} className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (!documents || documents.length === 0) return <tr><td colSpan={colSpan} className="text-center">{emptyMessage}</td></tr>;

  return (
    <> {/* Fragmento necesario para envolver múltiples <tr> */}
      {documents.map((doc, index) => (
        <DocumentTableRow
          // La key es CRÍTICA aquí. Usamos doc.id o un ID específico si existe, de lo contrario, index.
          key={doc.id || doc.idPurchase || doc.idNotaCredit || doc.saleId || index}
          doc={doc}
          index={index} // Pasa el 'index' a DocumentTableRow
          columns={columns}
          actionsProps={actionsProps}
          styles={styles}
          showRowActions={showRowActions}
          renderActionsCell={renderActionsCell} // Asegúrate de pasar esto si lo usa DocumentActions
        />
      ))}
    </>
  );
};