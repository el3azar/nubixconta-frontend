// src/components/credit-notes/form-components/SelectableSalesTable.jsx
import React from 'react';
import styles from '../../../styles/sales/NewCreditNote.module.css';

export const SelectableSalesTable = ({ sales, selectedSaleId, onSaleSelect, isLoading }) => (
  <section className={styles.ventasSection}>
    <h3>Ventas Aplicadas del Cliente</h3>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Número de Documento</th>
          <th>Monto</th>
          <th>Seleccionar</th>
        </tr>
      </thead>
      <tbody>
        {isLoading && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Buscando ventas...</td></tr>}
        {!isLoading && sales.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No se encontraron ventas aplicadas para este cliente.</td></tr>}
        {sales.map(sale => (
          <tr
            key={sale.saleId}
            className={selectedSaleId === sale.saleId ? styles.selectedRow : ''}
            onClick={() => onSaleSelect(sale)}
          >
            <td>{new Date(sale.issueDate).toLocaleDateString()}</td>
            <td>{sale.documentNumber}</td>
            <td>${sale.totalAmount.toFixed(2)}</td>
            <td><input type="radio" name="venta" checked={selectedSaleId === sale.saleId} readOnly /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);