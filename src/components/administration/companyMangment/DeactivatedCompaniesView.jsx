
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../companyMangment/CompanyDataContext'; 
import CompanySearchBar from '../companyMangment/CompanySearchBar'; 
import CompanyTable from '../companyMangment/CompanyTable'; 
import Swal from 'sweetalert2';
import styles from "../../../styles/sales/ViewCustomers.module.css";

const DeactivatedCompaniesView = () => {
  const navigate = useNavigate();
  const { companies, toggleCompanyStatus,loadingAssistants,getAssistantOptions } = useCompany(); 

  const [filters, setFilters] = useState({
    nombre: '',
    asistente: '',
    estado: ''
  });


  const assistantOptions = useMemo(() => {
    return getAssistantOptions();
  }, [getAssistantOptions]); 


  const filteredDeactivatedCompanies = useMemo(() => {

    if(loadingAssistants || !companies || companies.length===0){
      return [];
    }

    return companies.filter(company => company.activeStatus === false)
      .filter((e) => {
        const nombreMatch = e.nombre.toLowerCase().includes(filters.nombre.toLowerCase());
       const asistenteMatch = filters.asistente
          ? String(e.userId) === filters.asistente // Compara el userId de la empresa (convertido a string) con el valor del select
          : true;
        
        return nombreMatch && asistenteMatch;
      });
  }, [companies, filters, loadingAssistants]);

  // Función para "activar" una empresa desde esta vista
  const handleActivateCompany = async (company) => {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro que desea reactivar la empresa "${company.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const success = await toggleCompanyStatus(company.id, true); // Cambiar activeStatus a true

        if (success) {
          await Swal.fire('¡Éxito!', `La empresa "${company.nombre}" ha sido reactivada con éxito.`, 'success');

        } else {
          Swal.fire('Error', `Hubo un problema al reactivar la empresa "${company.nombre}".`, 'error');
        }
      } catch (error) {
        console.error("Error al reactivar la empresa:", error);
        Swal.fire('Error', 'Ocurrió un error inesperado al intentar reactivar la empresa.', 'error');
      }
    }
  };

  const handleGoBack = () => {
    navigate('/admin/empresas'); 
  };

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-4">EMPRESAS DESACTIVADAS</h2>

      <div className="p-4 rounded mb-3">
        <div className="row align-items-end g-3">
          <CompanySearchBar
            filters={filters}
            onChange={setFilters}
            onSearch={() => {}}
            assistantOptions={assistantOptions}
            isDeactivatedView={true}
          />
        </div>
      </div>
   
      <div className="mb-3 d-flex justify-content-between">
        <button className={styles.actionButton} onClick={handleGoBack}>
          Volver a Empresas Activas
        </button>
      </div>

      <CompanyTable
        companies={filteredDeactivatedCompanies}
        onToggleStatus={handleActivateCompany} //  misma prop para activar
        isDeactivatedView={true} // Nueva prop para controlar CompanyActions
      />
    </div>
  );
};

export default DeactivatedCompaniesView;