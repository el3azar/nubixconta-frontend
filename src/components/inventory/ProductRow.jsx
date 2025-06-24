import React from 'react';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ProductRow = ({ product, onEdit, onToggleStatus }) => {
  const rowClass = product.existencias === 0 ? 'table-danger' : '';

  return (
    <tr className={rowClass}>
      <td>{product.correlativo}</td> {/* 🟣 Cambiado */}
      <td>{product.codigo}</td>
      <td>{product.nombre}</td>
      <td>{product.unidad}</td>
      <td>{product.existencias}</td>
      <td>
        <div className="d-flex gap-3">
          <FaEdit
            role="button"
            title="Editar"
            onClick={() => onEdit(product)}
            style={{ color: '#1B043B', cursor: 'pointer' }}
          />
          {product.activo ? (
            <FaToggleOn
              role="button"
              title="Desactivar"
              onClick={() => onToggleStatus(product)}
              style={{ color: 'green', cursor: 'pointer' }}
            />
          ) : (
            <FaToggleOff
              role="button"
              title="Activar"
              onClick={() => onToggleStatus(product)}
              style={{ color: 'gray', cursor: 'pointer' }}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
