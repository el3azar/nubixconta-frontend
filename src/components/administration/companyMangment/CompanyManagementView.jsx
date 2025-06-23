import React, { useState } from 'react';
import CompanySearchBar from './CompanySearchBar';
import CompanyTable from './CompanyTable';
import RegisterCompanyButton from './RegisterCompanyButton';

const CompanyManagementView = () => {
  const [filters, setFilters] = useState({
    nombre: '',
    asistente: '',
    estado: ''
  });

  const [empresas, setEmpresas] = useState([
    { id: 1, nrc: '00000001', nombre: 'Empresa A', asignada: true, activa: true },
    { id: 2, nrc: '00000002', nombre: 'Empresa B', asignada: false, activa: true }
  ]);

  const handleSearch = () => {
    const filtradas = empresas.filter((e) => {
      const nombreMatch = e.nombre.toLowerCase().includes(filters.nombre.toLowerCase());
      const estadoMatch =
        !filters.estado ||
        (filters.estado === 'Asignadas' ? e.asignada : !e.asignada);
      return nombreMatch && estadoMatch;
    });
    setEmpresas(filtradas);
  };

  return (
    <div className="container py-4" >
      <h2 className="text-center fw-bold mb-4">GESTIÓN DE EMPRESAS</h2>

      <div className=" p-4 rounded mb-3">
        <div className="row align-items-end g-3">
          <CompanySearchBar
            filters={filters}
            onChange={setFilters}
            onSearch={handleSearch}
            assistantOptions={[
              { label: 'Asistente 1', value: '1' },
              { label: 'Asistente 2', value: '2' }
            ]}
          />
        </div>
      </div>

      <div className="mb-3 text-end">
        <RegisterCompanyButton onClick={() => console.log('Registrar')} />
      </div>

      <CompanyTable
        companies={empresas}
        onEdit={(e) => console.log('Editar', e)}
        onView={(e) => console.log('Ver', e)}
        onAccounting={(e) => console.log('Contabilidad', e)}
        onAssign={(e) => console.log('Asignar', e)}
        onToggleStatus={(e, nuevoEstado) => console.log('Cambio estado', e, nuevoEstado)}
      />
    </div>
  );
};

export default CompanyManagementView;
