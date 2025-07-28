import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext';
import CompanySearchBar from './CompanySearchBar';
import CompanyTable from './CompanyTable';
import RegisterCompanyButton from './RegisterCompanyButton';

const CompanyManagementView = () => {
  const navigate = useNavigate();
 const { companies, toggleCompanyStatus, updateCompany, fetchCompanies,getAssistantOptions, loadingAssistants } = useCompany();

  const [filters, setFilters] = useState({
    nombre: '',
    asistente: '',
    estado: ''
  });
  
   const assistantOptions = useMemo(() => {
    return getAssistantOptions();
  }, [getAssistantOptions]);

    useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((e) => {
      const nombreMatch = e.nombre.toLowerCase().includes(filters.nombre.toLowerCase());
      const activeStatusMatch = e.activeStatus === true;
      const asistenteMatch = filters.asistente
      ? String(e.userId) === filters.asistente 
          : true; 
      const estadoMatch =
        !filters.estado ||
        (filters.estado === 'Asignadas' ? e.asignada : !e.asignada);

      return nombreMatch && estadoMatch && activeStatusMatch && asistenteMatch;
    });
  }, [companies, filters,loadingAssistants]);

 
  const handleEdit = (company) => {
    navigate(`/admin/empresas/editar/${company.id}`, {
      state: { company }, 
    });
  };
  const handleView = (empresa) => navigate(`/admin/empresas/ver/${empresa.id}`);
  const handleAccounting = (empresa) => console.log('Contabilidad:', empresa);


const handleAssign = (empresa, userId) => {
  // Crea un nuevo objeto empresa actualizado con asignada = true
  const updatedCompany = { ...empresa, asignada: true };
  updateCompany(updatedCompany);
  Swal.fire({
    icon: 'success',
    title: `Empresa ${empresa.nombre} asignada con éxito`,
    timer: 1500,
  });
};

 const handleToggleCompanyStatus = async (empresa, newActiveStatus) => {
    // Si newActiveStatus es 'false', significa que queremos desactivar la empresa
    if (newActiveStatus === false) {
      const result = await Swal.fire({
        title: 'Confirmación',
        text: `¿Está seguro que desea desactivar la empresa "${empresa.nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        try {
          // Llama a la función del contexto que actualiza el backend
          const success = await toggleCompanyStatus(empresa.id, newActiveStatus);

          if (success) {
            // Muestra la alerta de éxito después de la actualización en el backend
            await Swal.fire('¡Éxito!', `La empresa "${empresa.nombre}" ha sido desactivada con éxito.`, 'success');

          } else {
            Swal.fire('Error', `Hubo un problema al desactivar la empresa "${empresa.nombre}".`, 'error');
          }
        } catch (error) {
          console.error("Error al desactivar la empresa:", error);
          Swal.fire('Error', 'Ocurrió un error inesperado al intentar desactivar la empresa.', 'error');
        }
      }
    }

  };
  


  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-4">GESTIÓN DE EMPRESAS</h2>

      <div className="p-4 rounded mb-3">
        <div className="row align-items-end g-3">
          <CompanySearchBar
            filters={filters}
            onChange={setFilters}
            onSearch={() => {}}
            assistantOptions={assistantOptions} 
          />
        </div>
      </div>

    
        <RegisterCompanyButton />
       
   
      <CompanyTable
        companies={filteredCompanies}
        onEdit={handleEdit}
        onView={handleView}
        onAccounting={handleAccounting}
        onAssign={handleAssign}
        onToggleStatus={handleToggleCompanyStatus}
        isDeactivatedView={false}

      />
    </div>
  );
};

export default CompanyManagementView;
