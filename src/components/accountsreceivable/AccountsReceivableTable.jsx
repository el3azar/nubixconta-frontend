// src/components/accountsreceivable/AccountsReceivableTable.js
import React, { useState } from 'react';
import styles from '../../styles/accountsreceivable/AccountsReceivable.module.css';
import { FaEye, FaEdit, FaTrash, FaCheck, FaBan, FaChevronDown, FaChevronUp } from 'react-icons/fa';
// Componente para la celda de descripción con lógica de expansión
const DescriptionCell = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = text.length > 40;

  return (
    <td className={styles.descripcionCell}>
      <div className={styles.descripcionWrapper}>
        <span>
          {isExpanded || !needsExpansion ? text : `${text.slice(0, 40)}...`}
        </span>
        {needsExpansion && (
          <button className={styles.toggleBtn} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>
    </td>
  );
};


// Componente para los iconos de acción
const TableRowActions = ({ row, onApply, onEdit, onDelete, onView, onCancel }) => {
  return (
    <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
      {row.estado === 'PENDIENTE' && (
        <>
          <FaCheck title="Aplicar" className={styles.icono} onClick={() => onApply(row.id)} />
          <FaEdit title="Editar" className={styles.icono} onClick={() => onEdit(row.id, row.documento)} />
          <FaTrash title="Eliminar" className={styles.icono} onClick={() => onDelete(row.id)} />
        </>
      )}
      {row.estado === 'APLICADO' && (
        <>
          <FaEye title="Ver" className={styles.icono} onClick={() => onView(row.id)} />
          <FaBan title="Anular" className={styles.icono} onClick={() => onCancel(row.id)} />
        </>
      )}
    </span>
  );
};

const AccountsReceivableTable = ({ data, actions }) => {
  if (!data.length) {
    return <p>No hay datos para mostrar.</p>;
  }

  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Correlativo</th>
            <th>Documento</th>
            <th>Estado</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Forma de pago</th>
            <th>Monto</th>
            <th>Monto total</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((fila) => (
            <tr key={`${fila.documento}-${fila.id}`} className={styles[`row-${fila.color}`]}>
              <td>{fila.correlativo}</td>
              <td>{fila.documento}</td>
              <td>{fila.estado}</td>
              <td>{fila.cliente}</td>
              <td>{fila.fecha}</td>
              <td>{fila.formaPago}</td>
              <td>{fila.monto}</td>
              <td>{fila.montoTotal}</td>
              <DescriptionCell text={fila.descripcion} />
              <td>
                <TableRowActions 
                    row={fila}
                    onApply={actions.onApply}
                    onEdit={actions.onEdit}
                    onDelete={actions.onDelete}
                    onView={actions.onView}
                    onCancel={actions.onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsReceivableTable;