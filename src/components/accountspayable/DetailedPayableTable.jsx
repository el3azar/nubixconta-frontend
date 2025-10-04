import React, { useState } from 'react';
import styles from '../../styles/accountsreceivable/AccountsReceivable.module.css';
import { FaEye, FaFileInvoiceDollar, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const DescriptionCell = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const safeText = typeof text === 'string' ? text : '';
  const needsExpansion = safeText.length > 40;

  return (
    <td className={styles.descripcionCell}>
      <div className={styles.descripcionWrapper}>
        <span>
          {isExpanded || !needsExpansion ? safeText : `${safeText.slice(0, 40)}...`}
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

const DetailedPayableTable = ({ data, actions }) => {
  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar. Realiza una búsqueda por fecha para ver los resultados.</p>;
  }

  return (
  <div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Correlativo</th>
            <th>Número de documento</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Monto total</th>
            <th>Saldo</th>
            <th>Días de crédito</th>
            <th>Descripción</th>
            <th>Acciones</th> 
          </tr>
        </thead>
        <tbody>
          {data.map((fila) => (
            // 2. Se elimina la clase de color dinámica para un aspecto neutral
            <tr key={fila.id}>
              <td>{fila.correlativo}</td>
              <td>{fila.documento}</td>
              <td>{fila.proveedor}</td>
              <td>{fila.fecha}</td>
               <td>{fila.montoTotal}</td>
              <td>{fila.saldo}</td>            
              <td>{fila.diasCredito}</td>
              <DescriptionCell text={fila.descripcion} />
              <td>
                {/* 3. Botones de acción fijos, sin lógica condicional */}
                <span style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
               
                  <FaFileInvoiceDollar 
                    title="Liquidar" 
                    className={styles.icono} 
                    onClick={() => actions.onLiquidate({ ...fila, idPurchase: fila.id })} 
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedPayableTable;