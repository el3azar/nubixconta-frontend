import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const RegisterCompanyButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/admin/empresas/registronuevo'); // 🔁 Ruta hacia la vista de registro de empresa
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-dark rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
    >
      Registrar Empresa
      <FiPlus size={18} />
    </button>
  );
};

export default RegisterCompanyButton;
