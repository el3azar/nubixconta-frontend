// src/services/banks/BankEntriesService.jsx
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8080/api/v1/bank-entries';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useBankEntriesService = () => {
  const { token } = useAuth();

  const listAllBankEntries = async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Parámetro para el nombre de la cuenta
      if (filters.accountName) {
        params.append('accountName', filters.accountName);
      }
      
      // --- IMPLEMENTACIÓN DEL FILTRO DE FECHAS ---
      // Mapeamos `dateFrom` del estado a `startDate` para el backend
      if (filters.dateFrom) {
        params.append('startDate', filters.dateFrom);
      }
      // Mapeamos `dateTo` del estado a `endDate` para el backend
      if (filters.dateTo) {
        params.append('endDate', filters.dateTo);
      }

      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader(token));
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 204) {
        return []; // Devuelve un array vacío si no hay contenido
      }
      console.error("Error fetching bank entries:", error);
      throw error;
    }
  };
  
  return {
    listAllBankEntries,
  };
};