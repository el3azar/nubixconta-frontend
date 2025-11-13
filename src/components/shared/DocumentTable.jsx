import React from 'react';
import { DocumentActions } from './DocumentActions';

// --- CAMBIO 1: DocumentTableRow AHORA ACEPTA 'index' ---
const DocumentTableRow = ({ doc, columns, actionsProps, styles, showRowActions, index }) => {
  const status = doc.status || doc.creditNoteStatus || doc.saleStatus || doc.purchaseStatus || doc.incomeTaxStatus;
  


   let rowClass = '';
  if (status === 'APLICADA') {
    rowClass = styles.rowApplied; 
  } else if (status === 'ANULADA') {
    rowClass = styles.rowAnnulled; 
  }
  
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

  // Función helper para obtener una clave única y fiable.
  const getUniqueKey = (doc, index) => {
    // 1. Se da prioridad a los IDs únicos y específicos de cada módulo.
    const key = doc.id || // Para Transacciones Contables, Bancos, etc.
                doc.saleId ||
                doc.idPurchase ||
                doc.idNotaCredit ||
                doc.idPurchaseCreditNote ||
                doc.idIncomeTax ||
                doc.idBankTransaction ||
                doc.idBankEntry;
    
    // 2. Si por alguna razón NINGÚN ID está presente, se usa el índice como último recurso.
    //    Se añade un prefijo para evitar colisiones con IDs numéricos (ej. 'fallback-0').
    return key !== undefined && key !== null ? key : `fallback-${index}`;
  };

  // --- CAMBIO 3: EL .map() AHORA PASA EL 'index' Y USA EL 'index' COMO FALLBACK KEY ---
  return documents.map((doc, index) => (
    <DocumentTableRow
      key={getUniqueKey(doc, index)}
      doc={doc}
      index={index} // Pasamos el 'index' como prop
      columns={columns}
      actionsProps={actionsProps}
      styles={styles}
      showRowActions={showRowActions} 
    />
  ));
};