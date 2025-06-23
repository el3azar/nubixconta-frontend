import React from 'react';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ProductRow = ({ product, index }) => {
  // Estilo condicional para existencias en 0
  const rowClass = product.existencias === 0 ? 'table-danger' : '';

  return (
    <tr className={rowClass}>
      <td>{index}</td>
      <td>{product.codigo}</td>
      <td>{product.nombre}</td>
      <td>{product.unidad}</td>
      <td>{product.existencias}</td>
      <td>
        <div className="d-flex gap-3">
          <FaEdit role="button" title="Editar" />
          {product.activo ? (
            <FaToggleOn role="button" title="Desactivar" />
          ) : (
            <FaToggleOff role="button" title="Activar" />
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
