import { createContext, useContext, useEffect, useState } from 'react';
import { getCompanies } from '../../../services/administration/companiesViewServices';


const CompanyDataContext = createContext();

export const useCompany = () => useContext(CompanyDataContext);

export const CompanyDataProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);

  // 🔁 Adaptar los datos del backend al formato usado internamente
  const adaptCompanyData = (rawCompanies) => {
    return rawCompanies.map((c, index) => ({
      id: index + 1, // O usa c.id si el backend lo provee
      nombre: c.companyName,
      nit: c.companyNit || '',
      dui: c.companyDui || '',
      nrc: c.companyNrc,
      tipo: c.companyDui ? 'natural' : 'juridica', 
      asignada: c.companyStatus
    }));
  };

  // 🔄 Obtener empresas desde el backend al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = await getCompanies();
        const adapted = adaptCompanyData(raw);
        setCompanies(adapted);
      } catch (error) {
        console.error("Error al cargar empresas:", error);
      }
    };

    fetchData();
  }, []);

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
      toggleCompanyStatus,
      getCompanyById
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
};

