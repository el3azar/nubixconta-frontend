import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Notifier } from "../../../utils/alertUtils";
import { useCompany } from './CompanyDataContext';
import styles from "../../../styles/sales/ViewCustomers.module.css";
const ViewCompanyDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { getCompanyById, loadingAssistants } = useCompany(); 

  const [empresa, setEmpresa] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true); 

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      // Espera a que los asistentes se carguen antes de intentar obtener la empresa
      if (loadingAssistants) {
        setLoadingCompany(true);
        return;
      }

      setLoadingCompany(true); // Inicia la carga
      try {
        const foundCompany = await getCompanyById(id); // Llama a la función asíncrona

        if (foundCompany) {
          setEmpresa(foundCompany);
        } else {
          Notifier.error('Empresa no encontrada')
          .then(() => navigate('/admin/empresas'));
        }
      } catch (error) {
        console.error("Error al cargar los detalles de la empresa:", error);
        Notifier.error('Hubo un problema al cargar los detalles de la empresa.')
       .then(() => navigate('/admin/empresas'));
      } finally {
        setLoadingCompany(false); // Finaliza la carga
      }
    };

    fetchCompanyDetails();
  }, [id, getCompanyById, navigate, loadingAssistants]); // Agrega loadingAssistants a las dependencias

  if (loadingCompany) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h5 className="text-center fw-bold mb-4">Información de la empresa</h5>
   {/* Sección para mostrar el logo de la empresa */}
      {empresa.imageUrl && (
        <div className="text-center mb-4">
          <img
            src={empresa.imageUrl}
            alt={`Logo de ${empresa.nombre}`}
            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd', padding: '5px', borderRadius: '8px' }}
          />
        </div>
      )}
      {/* Fin de la sección del logo */}
      
      {/* Nombre de persona jurídica o Natural */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Nombre de persona Jurídica o Natural:</label>
        <input type="text" className="form-control" value={empresa.nombre} disabled />
      </div>

      {/* Asistente Asignado (Nuevo campo) */}
      {empresa.assignedAssistantName && ( // Solo muestra si hay un asistente asignado
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Asistente Asignado:</label>
          <input type="text" className="form-control" value={empresa.assignedAssistantName} disabled />
        </div>
      )}

      {/* DUI o NIT */}
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

      {/* NRC */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Número de registro de contribuyente (NRC):</label>
        <input type="text" className="form-control" value={empresa.nrc} disabled />
      </div>

      {/* Dirección (Nuevo campo) */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Dirección:</label>
        <input type="text" className="form-control" value={empresa.direccion} disabled />
      </div>

      {/* Giro del negocio (Nuevo campo) */}
      <div className="mb-4">
        <label className="form-label fw-semibold text-dark">Giro de la empresa:</label>
        <input type="text" className="form-control" value={empresa.giro} disabled />
      </div>

      <button  className={styles.actionButton} onClick={() => navigate('/admin/empresas')}>
        Regresar
      </button>
    </div>
  );
};

export default ViewCompanyDetails;