// src/services/accounting/reportsService.js
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from 'react';

const BASE_URL = "http://localhost:8080/api/v1";

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook de servicio para los reportes financieros.
 */
export const useReportsService = () => {
  const { token } = useAuth();

  const getLibroDiario = useCallback(async (startDate, endDate) => {
    const endpoint = `${BASE_URL}/reports/libro-diario?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(endpoint, getAuthHeader(token));
    return response.data;
  }, [token]);

  const getLibroMayor = useCallback(async (filters = {}) => {
    // URLSearchParams es la forma más segura de construir URLs para evitar errores de formato.
    const params = new URLSearchParams();

    // Añadimos cada parámetro solo si existe en el objeto de filtros.
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.catalogId) params.append('catalogId', filters.catalogId);

    // Si no hay ningún parámetro, la query string será vacía.
    const queryString = params.toString();
    const endpoint = `${BASE_URL}/reports/libro-mayor${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(endpoint, getAuthHeader(token));
    return response.data;
  }, [token]);

  const getBalanzaComprobacion = useCallback(async (startDate, endDate) => {
    const endpoint = `${BASE_URL}/reports/balanza-comprobacion?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(endpoint, getAuthHeader(token));
    return response.data;
  }, [token]);

  // --- INICIO DE LA MODIFICACIÓN ---
  const getEstadoResultados = useCallback(async (startDate, endDate) => {
    const endpoint = `${BASE_URL}/reports/estado-resultados?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(endpoint, getAuthHeader(token));
    return response.data;
  }, [token]);

  return {
    getLibroDiario,
    getLibroMayor,
    getBalanzaComprobacion,
    getEstadoResultados,
  };
};