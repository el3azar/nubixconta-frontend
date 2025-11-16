import React from 'react';
import { DocumentActions } from './DocumentActions';
import { formatDate } from '../../utils/dateFormatter'; // Mantenemos las importaciones necesarias

const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions, index }) => {
  // Mantenemos la lógica de detección de estado mejorada para todos los módulos
  const status = doc.status || doc.creditNoteStatus || doc.saleStatus || doc.purchaseStatus || doc.incomeTaxStatus || doc.bankTransactionStatus;
  
  // Mantenemos la definición del ID para evitar el ReferenceError
  const id = doc.id || doc.saleId || doc.idPurchase || doc.idNotaCredit || doc.idPurchaseCreditNote || doc.idIncomeTax || doc.idBankTransaction || doc.idBankEntry;

  // --- SOLUCIÓN: Usamos las clases de Bootstrap que sí funcionan ---
  // En lugar de usar 'styles.rowApplied', volvemos a las clases 'table-success' y 'table-danger'
  // de tu versión anterior, ya que estas sí tienen estilos definidos globalmente.
  let rowClass = '';
 if (showRowActions) {
    if (status === 'APLICADA') {
      rowClass = 'table-success'; 
    } else if (status === 'ANULADA') {
      rowClass = 'table-danger'; 
    }
  }
  
  return (
    // Ahora 'rowClass' tendrá 'table-success' o 'table-danger' y los colores se aplicarán
    <tr className={rowClass}>
      {columns.map((col) => {
        // Mantenemos toda la lógica de renderizado avanzada para las celdas
        let cellContent;
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

        if (col.cell) {
          cellContent = col.cell(doc, index);
        } else if (col.accessor === 'amount' || col.accessor === 'debit' || col.accessor === 'credit') {
          const num = typeof cellContent === 'number' ? cellContent : 0;
          cellContent = `$${num.toFixed(2)}`;
        } else if (col.accessor === 'transactionDate' || col.accessor === 'date') {
          cellContent = formatDate(cellContent);
        }

        return (
          // Mantenemos la corrección de la 'key' para evitar warnings en la consola
          <td key={`${id || index}-${col.accessor || col.header}`} style={col.style || {}} className={col.className || styles.textAlignCenter}>
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


// El resto del componente no necesita cambios
export const DocumentTable = ({ documents, isLoading, isError, error, actionsProps, styles, columns, showRowActions, emptyMessage }) => {
  const colSpan = columns.length + (showRowActions ? 1 : 0);

  if (isLoading) return <tr><td colSpan={colSpan} className="text-center">Cargando documentos...</td></tr>;
  if (isError) return <tr><td colSpan={colSpan} className="text-center text-danger p-4"><strong>Error:</strong> {error.response?.data?.message || error.message}</td></tr>;
  if (!documents || documents.length === 0) return <tr><td colSpan={colSpan} className="text-center">{emptyMessage}</td></tr>;

  const getUniqueKey = (doc, index) => {
    const key = doc.id ||
                doc.saleId ||
                doc.idPurchase ||
                doc.idNotaCredit ||
                doc.idPurchaseCreditNote ||
                doc.idIncomeTax ||
                doc.idBankTransaction ||
                doc.idBankEntry;
    
    return key !== undefined && key !== null ? key : `fallback-${index}`;
  };

  return documents.map((doc, index) => (
    <DocumentTableRow
      key={getUniqueKey(doc, index)}
      doc={doc}
      index={index}
      columns={columns}
      actionsProps={actionsProps}
      styles={styles}
      showRowActions={showRowActions} 
    />
  ));
};