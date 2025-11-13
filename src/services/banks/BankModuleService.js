import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Endpoint base para las entradas de banco, al que le añadiremos /bank
const API_URL = 'http://localhost:8080/api/v1/bank-entries/bank';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useBankModuleService = () => {
  const { token } = useAuth();

  /**
   * Filtra las transacciones específicas del módulo de Bancos.
   * @param {object} filters - Objeto con los filtros a aplicar.
   * @param {string} filters.accountName - Nombre de la cuenta a buscar.
   * @param {string} filters.dateFrom - Fecha de inicio (YYYY-MM-DD).
   * @param {string} filters.dateTo - Fecha de fin (YYYY-MM-DD).
   * @returns {Promise<Array>} - Una promesa que resuelve a un array de transacciones.
   */
  const filterBankModuleEntries = async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.accountName) {
        params.append('accountName', filters.accountName);
      }
      if (filters.dateFrom) {
        params.append('startDate', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('endDate', filters.dateTo);
      }

      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader(token));
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 204) {
        return []; // Devuelve un array vacío si no hay contenido (No Content)
      }
      console.error("Error fetching bank module entries:", error);
      throw error;
    }
  };
  
  return {
    filterBankModuleEntries,
  };
};