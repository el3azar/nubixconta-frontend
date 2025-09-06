import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCompanyById as getCompanyByIdService  } from '../../../services/administration/company/companyByIdService';
import { updateCompanyService } from '../../../services/administration/company/updateCompanyService';
import { getCompaniesInactive } from '../../../services/administration/company/companiesViewUnassigned';
import { getCompaniesActive } from '../../../services/administration/company/companiesViewServices';
import { getUsersByAssistant } from '../../../services/administration/company/usersByAssistanService';

const CompanyDataContext = createContext();

export const useCompany = () => useContext(CompanyDataContext);

export const CompanyDataProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true); 

  // 1. Cargar la lista de asistentes al montar el componente
    useEffect(() => {
    const fetchAndSetAssistants = async () => {
      try {
        const users = await getUsersByAssistant();
        const assistantsMap = users.reduce((acc, user) => {
          acc[user.id] = `${user.firstName} ${user.lastName}`;
          return acc;
        }, {});
        setAssistants(assistantsMap);
      } catch (error) {
        console.error("Error al cargar asistentes en CompanyDataContext:", error);
      } finally {
        setLoadingAssistants(false); 
      }
    };
    fetchAndSetAssistants();
  }, []); // Se ejecuta solo una vez al montar


  const adaptCompanyData = (rawCompanies,isActive = null) => {
    return rawCompanies.map((c) => {
      const assignedAssistantName = c.userId ? (assistants[c.userId] || '') : '';
      return {
      id: c.id, 
      nombre: c.companyName,
      nit: c.companyNit || '',
      dui: c.companyDui || '',
      nrc: c.companyNrc,
      tipo: c.companyDui ? 'natural' : 'juridica', 
      asignada: c.companyStatus,
       activeStatus: isActive !== null ? isActive : c.activeStatus,
      assignedAssistantName: assignedAssistantName,
      userId: c.userId || null,
      };
      });
  };

    const fetchCompanies = useCallback(async () => {
    try {
       // Obtener empresas activas
      const rawActive = await getCompaniesActive();
      const adaptedActive = adaptCompanyData(rawActive,true);

      // Obtener empresas inactivas
      const rawInactive = await getCompaniesInactive();
      const adaptedInactive = adaptCompanyData(rawInactive,false);

      // Combinar ambas listas
      const combinedCompanies = [...adaptedActive, ...adaptedInactive];
    
      // Deduplicar por ID para asegurar que no haya elementos repetidos
      const uniqueCompanies = Array.from(
        new Map(combinedCompanies.map(company => [company.id, company])).values()
      );

      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    }
  }, [loadingAssistants,assistants])


   useEffect(() => {
    if (!loadingAssistants) {
      fetchCompanies();
    }
  }, [loadingAssistants, fetchCompanies]);

  //  Agrega una empresa nueva
  const addCompany = (newCompany) => {
    const id = companies.length ? Math.max(...companies.map(c => c.id)) + 1 : 1;
    setCompanies(prev => [...prev, { ...newCompany, id }]);
  };

const updateCompany = async (company) => {
  try {
    await updateCompanyService(company.id, {
      companyName: company.companyName,
      turnCompany: company.turnCompany,
      companyNit: company.companyNit,
      companyDui: company.companyDui,
      address: company.address,
      companyNrc: company.companyNrc,
      activeStatus:company.activeStatus,
      userId: company.userId || null,
      imageUrl: company.imageUrl, 
    });

    // Actualiza localmente en el estado del contexto
   setCompanies(prev =>
        prev.map(c => {
          if (c.id === company.id) {
            const newAssignedAssistantName = company.userId ? (assistants[company.userId] || '') : '';
            return { ...c, ...company, assignedAssistantName: newAssignedAssistantName };
          }
          return c;
        })
      );

    return true;
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return false;
  }
};

  //  Cambia el estado "activa" de una empresa
  const toggleCompanyStatus = async (id, newActiveStatus) => {
    try {
      await updateCompanyService(id, { activeStatus: newActiveStatus });

      setCompanies((prev) => {
        // Actualiza el estado local para reflejar el cambio
        return prev.map((c) =>
          c.id === id ? { ...c, activeStatus: newActiveStatus } : c
        );
      });
      return true;
    } catch (error) {
      console.error('Error al cambiar el estado de la empresa:', error.response?.data?.message || error.message);
      return false;
    }
  };
  // Obtiene una empresa por ID (útil para vista de detalles o edición)

const getCompanyById = async (id) => {
  try {
    const response = await getCompanyByIdService(id);
    const assignedAssistantName = response.userId ? (assistants[response.userId] || '') : ''; 
    return {
    id: response.id,
    nombre: response.companyName,
    giro: response.turnCompany || '',
    nit: response.companyNit || '',
    dui: response.companyDui || '',
    direccion: response.address || '',
    nrc: response.companyNrc,
    tipo: response.companyDui ? 'natural' : 'juridica',
    asignada: response.companyStatus,
    activeStatus:response.activeStatus,
    assignedAssistantName: assignedAssistantName,
    userId: response.userId || null,
    imageUrl: response.imageUrl,
};
  } catch (error) {
    console.error("Error al obtener empresa por ID:", error);
    return null;
  }
};
// Obtener opciones para el select de asistentes
  const getAssistantOptions = useCallback(() => {
    if (loadingAssistants) {
      return []; // Devuelve un array vacío mientras cargan
    }
    const options = Object.entries(assistants).map(([id, name]) => ({
      value: id, // El ID del usuario como valor
      label: name, // El nombre completo como etiqueta
    }));
    return [{ value: '', label: 'Todos' }, ...options];
  }, [assistants, loadingAssistants]);

  return (
    <CompanyDataContext.Provider value={{
      companies,
      addCompany,
      updateCompany,
      toggleCompanyStatus,
      getCompanyById,
      fetchCompanies,
      loadingAssistants,
      getAssistantOptions,
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
};


