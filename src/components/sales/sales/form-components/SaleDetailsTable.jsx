// src/components/sales/form-components/SaleDetailsTable.jsx
import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import styles from '../../../../styles/sales/SaleForm.module.css';

/**
 * Componente de presentación para la tabla que muestra los detalles ya añadidos a la venta.
 */
export const SaleDetailsTable = ({ fields, productOptions, onEdit, onDelete, errors }) => {
  return (
    <section className="mb-4">
      <h5 className="mb-2">Detalle de la Venta</h5>
      <div className="table-responsive" style={{ background: '#fff', borderRadius: 8 }}>
        <table className={`table table-bordered align-middle mb-0 ${styles.table}`}>
          <thead>
            <tr className={styles.tableHead}>
              <th>Tipo</th><th>Nombre</th><th>Código</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Imp.</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const nombre = field.productId ? field._productName : field.serviceName;
              const codigo = field.productId ? field._productCode : '';
              return (
                <tr key={field.id}>
                  <td>{field.productId ? 'Producto' : 'Servicio'}</td>
                  <td>{nombre}</td>
                  <td>{codigo}</td>
                  <td>{field.quantity}</td>
                  <td>{field.unitPrice.toFixed(2)}</td>
                  <td>{field.subtotal.toFixed(2)}</td>
                  <td>{field.impuesto ? '✔' : '✘'}</td>
                  <td>
                    <button type="button" className={`${styles.iconBtn} ${styles.editBtn} btn btn-sm me-1`} onClick={() => onEdit(index)}><FaEdit /></button>
                    <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn} btn btn-sm`} onClick={() => onDelete(index)}><FaTrash /></button>
                  </td>
                </tr>
              );
            })}
             {fields.length === 0 && (
                <tr><td colSpan="8" className="text-center p-3">Aún no has añadido productos o servicios.</td></tr>
            )}
          </tbody>
        </table>
        {errors.saleDetails && <p className='text-danger small mt-2'>{errors.saleDetails.message || errors.saleDetails.root?.message}</p>}
      </div>
    </section>
  );
};