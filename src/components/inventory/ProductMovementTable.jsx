import React from 'react';
import ProductMovementRow from './ProductMovementRow';
import { BsSortAlphaDown, BsSortAlphaUp, BsFunnelFill } from 'react-icons/bs';

const ProductMovementTable = ({ movements, nameOrder, setNameOrder, dateOrder, setDateOrder }) => {
  const toggleNameOrder = () => {
    setNameOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const toggleDateOrder = () => {
    setDateOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="table-responsive bg-white rounded shadow p-3">
      <table className="table table-bordered table-hover text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>Correlativo</th>
            <th>Código de producto</th>
            <th>
              Nombre del producto{' '}
              <span role="button" onClick={toggleNameOrder}>
                {nameOrder === 'asc' ? (
                  <BsSortAlphaDown />
                ) : nameOrder === 'desc' ? (
                  <BsSortAlphaUp />
                ) : (
                  <BsFunnelFill />
                )}
              </span>
            </th>
            <th>Unidad de Representación</th>
            <th>
              Fecha{' '}
              <span role="button" onClick={toggleDateOrder}>
                {dateOrder === 'asc' ? (
                  <BsSortAlphaDown />
                ) : dateOrder === 'desc' ? (
                  <BsSortAlphaUp />
                ) : (
                  <BsFunnelFill />
                )}
              </span>
            </th>
            <th>Tipo de movimiento</th>
            <th>Observación</th>
            <th>Módulo</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((item, index) => (
            <ProductMovementRow key={index} data={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductMovementTable;
