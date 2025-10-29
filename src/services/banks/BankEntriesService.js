// src/services/banks/BankEntriesService.jsx
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Asumo que AuthContext existe en esta ruta

const API_URL = 'http://localhost:8080/api/v1/bank-entries';

// Función helper para obtener los headers de autenticación
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useBankEntriesService = () => {
  const { token } = useAuth(); // Obtener el token del contexto

  const listAllBankEntries = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.idCatalog) params.append('accountName', filters.idCatalog); // Asumo que idCatalog se mapea a accountName
      if (filters.dateFrom) params.append('startDate', filters.dateFrom);
      if (filters.dateTo) params.append('endDate', filters.dateTo);

      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader(token));
      return response.data;
    } catch (error) {
      console.error("Error fetching bank entries:", error);
      throw error;
    }
  };


  return {
    listAllBankEntries,
  };
};