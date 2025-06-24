import React from 'react';

const ProductMovementRow = ({ data }) => {
  const isInvalidDate = data.fecha === '00/00/0000';

  return (
    <tr className={isInvalidDate ? 'table-danger' : ''}>
      <td>{data.correlativo}</td>
      <td>{data.codigoProducto}</td>
      <td>{data.nombreProducto}</td>
      <td>{data.unidad}</td>
      <td>{data.fecha}</td>
      <td>{data.tipoMovimiento}</td>
      <td>{data.observacion}</td>
      <td>{data.modulo}</td>
    </tr>
  );
};

export default ProductMovementRow;
