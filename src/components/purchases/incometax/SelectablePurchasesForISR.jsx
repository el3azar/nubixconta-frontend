// src/components/purchases/incometax/SelectablePurchasesForISR.jsx

import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
// Usamos los mismos estilos que el formulario de NC para consistencia
import styles from '../../../styles/sales/NewCreditNote.module.css';

/**
 * Muestra una tabla de compras aplicadas para que el usuario seleccione una
 * antes de crear una retención de ISR.
 */
export const SelectablePurchasesForISR = ({ purchases, selectedPurchaseId, onPurchaseSelect, isLoading }) => (
  <section className={styles.ventasSection}>
    <h3>Paso 1: Seleccionar la Compra a la que se aplicará la retención</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha de Emisión</th>
            <th>Número de Documento</th>
            <th>Monto Total</th>
            <th>Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Buscando compras aplicadas...</td></tr>
          )}
          {!isLoading && purchases.length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No se encontraron compras aplicadas para este proveedor.</td></tr>
          )}
          {purchases.map(purchase => (
            <tr
              key={purchase.idPurchase}
              className={selectedPurchaseId === purchase.idPurchase ? styles.selectedRow : ''}
              onClick={() => onPurchaseSelect(purchase)}
            >
              <td>{formatDate(purchase.issueDate)}</td>
              <td>{purchase.documentNumber}</td>
              <td>${purchase.totalAmount?.toFixed(2) || '0.00'}</td>
              <td>
                <input
                  type="radio"
                  name="purchase_selection"
                  checked={selectedPurchaseId === purchase.idPurchase}
                  readOnly
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);