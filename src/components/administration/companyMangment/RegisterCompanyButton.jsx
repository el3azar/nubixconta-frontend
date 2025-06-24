import React from 'react';
import { FiPlus } from 'react-icons/fi';

const RegisterCompanyButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="btn btn-dark rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
    >
      Registrar Empresa
      <FiPlus size={18} />
    </button>
  );
};

export default RegisterCompanyButton;
