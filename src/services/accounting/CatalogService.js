// src/services/accounting/CatalogService.jsx

import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // 1. Importar el hook de autenticación

const API_URL = 'http://localhost:8080/api/v1/catalogs';

// 2. Añadir la misma función helper para el header que usan los otros servicios
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useCatalogService = () => {
  const { token } = useAuth(); // 3. Obtener el token del contexto

  const searchCatalogs = async (term) => {
    // 4. Usar getAuthHeader en la llamada de axios
    const response = await axios.get(`${API_URL}/search`, {
      params: { term: term || '' },
      ...getAuthHeader(token) // Se añaden los headers a la configuración de la petición
    });
    return response.data;
  };

  return {
    searchCatalogs,
  };
};