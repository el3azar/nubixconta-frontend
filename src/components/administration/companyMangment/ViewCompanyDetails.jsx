// src/components/administration/companyManagment/ViewCompanyDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext'; // Contexto global

const ViewCompanyDetails = () => {
  const { id } = useParams(); // ID desde la URL
  const navigate = useNavigate();
  const { getCompanyById } = useCompany(); // Función del contexto

  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const encontrada = getCompanyById(id);
    if (encontrada) {
      setEmpresa(encontrada);
    } else {
      Swal.fire({
        title: 'Empresa no encontrada',
        icon: 'error',
        confirmButtonColor: '#d33'
      }).then(() => navigate('/admin/empresas'));
    }
  }, [id, getCompanyById, navigate]);

  if (!empresa) return null;

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h5 className="text-center fw-bold mb-4">Información de la empresa</h5>

      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Nombre de persona jurídica o Natural:</label>
        <input type="text" className="form-control" value={empresa.nombre} disabled />
      </div>

      {empresa.tipo === 'juridica' && (
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">NIT:</label>
          <input type="text" className="form-control" value={empresa.nit} disabled />
        </div>
      )}

      {empresa.tipo === 'natural' && (
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">DUI:</label>
          <input type="text" className="form-control" value={empresa.dui} disabled />
        </div>
      )}

      <div className="mb-4">
        <label className="form-label fw-semibold text-dark">Número de registro de contribuyente (NRC):</label>
        <input type="text" className="form-control" value={empresa.nrc} disabled />
      </div>

      <button className="btn btn-dark px-4" onClick={() => navigate('/admin/empresas')}>
        Regresar
      </button>
    </div>
  );
};

export default ViewCompanyDetails;
