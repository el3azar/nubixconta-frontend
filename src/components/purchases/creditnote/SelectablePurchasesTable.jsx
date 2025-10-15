// src/components/purchases/creditnote/SelectablePurchasesTable.jsx

import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
// Usaremos los mismos estilos que la tabla de selección de ventas para mantener la consistencia.
import styles from '../../../styles/sales/NewCreditNote.module.css';

/**
 * Componente presentacional para mostrar una tabla de compras elegibles para NC.
 * @param {Array} purchases - Lista de compras (PurchaseForCreditNoteDTO).
 * @param {number} selectedPurchaseId - El ID de la compra actualmente seleccionada.
 * @param {Function} onPurchaseSelect - Callback que se ejecuta al seleccionar una fila.
 * @param {boolean} isLoading - Estado de carga para mostrar un mensaje al usuario.
 */
export const SelectablePurchasesTable = ({ purchases, selectedPurchaseId, onPurchaseSelect, isLoading }) => (
  <section className={styles.ventasSection}>
    <h3>Paso 1: Seleccionar la Compra a Devolver</h3>
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
          {/* --- Renderizado Condicional --- */}
          {isLoading && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Buscando compras elegibles...</td></tr>
          )}
          {!isLoading && purchases.length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No se encontraron compras aplicadas para este proveedor.</td></tr>
          )}
          
          {/* --- Mapeo de Datos --- */}
          {purchases.map(purchase => (
            <tr
              key={purchase.idPurchase}
              // Si la fila está seleccionada, se le aplica una clase CSS.
              className={selectedPurchaseId === purchase.idPurchase ? styles.selectedRow : ''}
              // Al hacer clic en la fila, se ejecuta la función callback.
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
                  readOnly // El control se maneja con el onClick de la fila.
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);