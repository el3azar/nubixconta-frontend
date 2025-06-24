// src/context/CompanyDataContext.jsx
import { createContext, useContext, useState } from 'react';

const CompanyDataContext = createContext();

export const useCompany = () => useContext(CompanyDataContext);

export const CompanyDataProvider = ({ children }) => {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      nombre: 'Empresa A',
      nit: '0614-123456-101-2',
      dui: '',
      nrc: '00000001',
      tipo: 'juridica',
      asignada: true,
      activa: true
    },
    {
      id: 2,
      nombre: 'Empresa B',
      nit: '',
      dui: '12345678-9',
      nrc: '00000002',
      tipo: 'natural',
      asignada: false,
      activa: true
    }
  ]);

  // ✅ Agrega una empresa nueva
  const addCompany = (newCompany) => {
    const id = companies.length ? Math.max(...companies.map(c => c.id)) + 1 : 1;
    setCompanies(prev => [...prev, { ...newCompany, id }]);
  };

  // ✅ Actualiza los datos de una empresa existente
  const updateCompany = (updatedCompany) => {
    setCompanies(prev =>
      prev.map(c => (c.id === updatedCompany.id ? updatedCompany : c))
    );
  };

  // ✅ Cambia el estado "activa" de una empresa
  const toggleCompanyStatus = (id, nuevaActivo) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === id ? { ...c, activa: nuevaActivo } : c
      )
    );
  };

  // ✅ Obtiene una empresa por ID (útil para vista de detalles o edición)
  const getCompanyById = (id) => {
    return companies.find(c => c.id === parseInt(id));
  };

  return (
    <CompanyDataContext.Provider value={{
      companies,
      addCompany,
      updateCompany,
      toggleCompanyStatus, // 👉 Exportamos la nueva función
      getCompanyById
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
};

/*
📌 Cuando integres backend:
- Usa useEffect para cargar empresas desde una API (GET /api/empresas).
- addCompany debe hacer POST /api/empresas y luego actualizar el estado local.
- updateCompany debe hacer PUT /api/empresas/:id.
- toggleCompanyStatus puede hacer PATCH o PUT a /api/empresas/:id.
*/
