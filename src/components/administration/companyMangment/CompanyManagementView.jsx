import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext';
import CompanySearchBar from './CompanySearchBar';
import CompanyTable from './CompanyTable';
import RegisterCompanyButton from './RegisterCompanyButton';

const CompanyManagementView = () => {
  const navigate = useNavigate();
 const { companies, toggleCompanyStatus, updateCompany } = useCompany();

  const [filters, setFilters] = useState({
    nombre: '',
    asistente: '',
    estado: ''
  });

  const filteredCompanies = useMemo(() => {
    return companies.filter((e) => {
      const nombreMatch = e.nombre.toLowerCase().includes(filters.nombre.toLowerCase());
      const estadoMatch =
        !filters.estado ||
        (filters.estado === 'Asignadas' ? e.asignada : !e.asignada);
      return nombreMatch && estadoMatch;
    });
  }, [companies, filters]);

  const handleEdit = (empresa) => navigate(`/admin/empresas/editar/${empresa.id}`);
  const handleView = (empresa) => navigate(`/admin/empresas/ver/${empresa.id}`);
  const handleAccounting = (empresa) => console.log('Contabilidad:', empresa);


const handleAssign = (empresa, userId) => {
  // Crea un nuevo objeto empresa actualizado con asignada = true
  const updatedCompany = { ...empresa, asignada: true };
  updateCompany(updatedCompany);

  // Opcional: podrías mostrar un mensaje de éxito o refrescar lista
  Swal.fire({
    icon: 'success',
    title: `Empresa ${empresa.nombre} asignada con éxito`,
    timer: 1500,
  });
};

  const handleToggleStatus = (empresa, nuevoEstado) => {
    toggleCompanyStatus(empresa.id, nuevoEstado);
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
            assistantOptions={[
              { label: 'Asistente 1', value: '1' },
              { label: 'Asistente 2', value: '2' }
            ]}
          />
        </div>
      </div>

      <div className="mb-3 text-end">
        <RegisterCompanyButton />
      </div>

      <CompanyTable
        companies={filteredCompanies}
        onEdit={handleEdit}
        onView={handleView}
        onAccounting={handleAccounting}
        onAssign={handleAssign}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default CompanyManagementView;
