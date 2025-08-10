import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// La URL base es dinámica, así que la construiremos en la función
const BASE_URL = "http://localhost:8080/api/v1";

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook de servicio para funcionalidades contables de visualización.
 */
export const AccountingService = () => {
  const { token } = useAuth();

  // Mapea el tipo de la URL a la ruta de la API
  const API_PATHS = {
    'venta': 'sales',
    'nota-credito': 'credit-notes',
  };

  /**
   * Obtiene el asiento contable para un documento específico.
   * @param {string} type - El tipo de documento ('venta' o 'nota-credito').
   * @param {number} id - El ID del documento.
   * @returns {Promise<object>} El DTO del asiento contable.
   */
  const getAccountingEntry = async (type, id) => {
    const basePath = API_PATHS[type];
    if (!basePath) {
      throw new Error(`Tipo de documento no válido: ${type}`);
    }

    const url = `${BASE_URL}/${basePath}/${id}/accounting-entry`;
    const response = await axios.get(url, getAuthHeader(token));
    return response.data;
  };

  return {
    getAccountingEntry,
  };
};