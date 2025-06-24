import React from 'react';
import { FaPlus } from 'react-icons/fa';

const RegisterProductButton = () => {
  return (
    <button
      className="btn d-flex align-items-center gap-2 px-3 py-2"
      style={{
        backgroundColor: '#3D3457',
        color: 'white',
        borderRadius: '999px',
      }}
      type="submit"
    >
      <FaPlus />
      Registrar Producto
    </button>
  );
};

export default RegisterProductButton;

//nota, no lo use jasjasjasjasj o si?

