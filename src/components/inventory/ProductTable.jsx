import React from 'react';
import ProductRow from './ProductRow';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ProductTable = ({ products, handleSort, sortField, sortDirection }) => {
  // Función para renderizar ícono según el campo actual
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-2" />;
    return sortDirection === 'asc' ? <FaSortUp className="ms-2" /> : <FaSortDown className="ms-2" />;
  };

  return (
    <div className="bg-white rounded shadow p-4 w-100 mx-auto mt-4" style={{ maxWidth: '1000px' }}>
      <table className="table table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Código</th>
            <th role="button" onClick={() => handleSort('nombre')}>
              Nombre {renderSortIcon('nombre')}
            </th>
            <th>Unidad</th>
            <th role="button" onClick={() => handleSort('existencias')}>
              Existencias {renderSortIcon('existencias')}
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <ProductRow key={product.id || index} product={product} index={index + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
