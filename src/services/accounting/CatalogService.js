// src/services/accounting/CatalogService.js

import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCallback } from 'react'; // <-- 1. Importar useCallback

const API_BASE_URL = 'http://localhost:8080/api/v1';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useCatalogService = () => {
  const { token } = useAuth();

  // --- 2. Envolvemos cada función con useCallback ---
  // Esto asegura que la función no se vuelva a crear en cada render,
  // a menos que su dependencia (el 'token') cambie.

  const getMasterTree = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/accounts/master/tree`, getAuthHeader(token));
    return response.data;
  }, [token]); // Dependencia: token

  const getCompanyTree = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/catalogs/my-company/tree`, getAuthHeader(token));
    return response.data;
  }, [token]); // Dependencia: token

  const activateAccounts = useCallback(async (masterAccountIds) => {
    const response = await axios.post(`${API_BASE_URL}/catalogs/activate`, { masterAccountIds }, getAuthHeader(token));
    return response.data;
  }, [token]); // Dependencia: token

   const deactivateAccounts = useCallback(async (catalogIds) => {
    const response = await axios.post(`${API_BASE_URL}/catalogs/deactivate`, { catalogIds }, getAuthHeader(token));
    return response.data; // Devuelve una respuesta vacía en caso de éxito (200 OK)
  }, [token]);

  const updateAccount = useCallback(async (catalogId, updateData) => {
    const response = await axios.put(`${API_BASE_URL}/catalogs/${catalogId}`, updateData, getAuthHeader(token));
    return response.data;
  }, [token]); // Dependencia: token
  
  const uploadCatalogFile = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        ...getAuthHeader(token).headers,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await axios.post(`${API_BASE_URL}/catalogs/upload`, formData, config);
    return response.data;
  }, [token]); // Dependencia: token

  const searchCatalogs = useCallback(async (term) => {
    const response = await axios.get(`${API_BASE_URL}/catalogs/search`, {
      params: { term: term || '' },
      ...getAuthHeader(token)
    });
    return response.data;
  }, [token]); // Dependencia: token

  return {
    getMasterTree,
    getCompanyTree,
    activateAccounts,
    updateAccount,
    deactivateAccounts, 
    uploadCatalogFile,
    searchCatalogs,
  };
};