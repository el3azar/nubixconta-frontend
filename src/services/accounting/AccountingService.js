import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from 'react';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook de servicio para funcionalidades de visualización del asiento contable de otros módulos.
 */
export const useAccountingViewerService = () => {
  const { token } = useAuth();
  const API_PATHS = { 'venta': 'sales', 'nota-credito': 'credit-notes', 'compra': 'purchases', 'nota-credito-compra': 'purchase-credit-notes', 'retencion-isr': 'income-taxes' };

  const getAccountingEntry = useCallback(async (type, id) => {
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // 1. Manejamos el nuevo tipo de documento como un caso especial aquí, en el servicio.
    if (type === 'transaccion-contable') {
      const url = `${BASE_URL}/accounting/transactions/${id}`;
      const response = await axios.get(url, getAuthHeader(token));
      const transaction = response.data; // Este es un TransactionAccountingResponseDTO

      // 2. Transformamos el DTO de la transacción a la estructura que el componente <AccountingEntry> espera.
      //    Esto mantiene el componente de la UI reutilizable y sin lógica de negocio.
      return {
        accountingEntryId: transaction.id,
        entryDate: transaction.transactionDate,
        documentType: transaction.moduleType,
        documentNumber: transaction.id,
        partnerLabel: 'N/A',
        partnerName: 'N/A',
        description: transaction.description,
        documentStatus: transaction.status,
        lines: transaction.entries, // El DTO ya tiene 'entries'
        totalDebits: transaction.totalDebe, // Mapeamos el nombre del campo
        totalCredits: transaction.totalHaber, // Mapeamos el nombre del campo
      };
    }
    // --- FIN DE LA MODIFICACIÓN ---

    // 3. La lógica original para todos los demás documentos permanece intacta.
    const basePath = API_PATHS[type];
    if (!basePath) {
      throw new Error(`Tipo de documento no válido: ${type}`);
    }

    const url = `${BASE_URL}/${basePath}/${id}/accounting-entry`;
    const response = await axios.get(url, getAuthHeader(token));
    return response.data;

  }, [token]);

  return { getAccountingEntry };
};

/**
 * Hook de servicio para la gestión de Transacciones Contables manuales.
 */
export const useAccountingTransactionService = () => {
    const { token } = useAuth();
    const API_URL = `${BASE_URL}/accounting/transactions`;

    const getAll = useCallback(async (sortBy = 'status') => {
        const response = await axios.get(`${API_URL}?sortBy=${sortBy}`, getAuthHeader(token));
        return response.data;
    }, [token]);

    const getById = useCallback(async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader(token));
        return response.data;
    }, [token]);
    
     /**
     * Busca transacciones usando filtros opcionales.
     * Llama a /report si hay filtros, de lo contrario llama al endpoint principal.
     * @param {object} filters - Objeto con { startDate, endDate, status }.
     */
    const search = useCallback(async (filters = {}) => {
        // Esta función solo se activa si hay filtros de fecha.
        if (!filters.startDate && !filters.endDate) {
            // DocumentListView no llamará a search si no hay filtros, pero es una buena salvaguarda.
            return [];
        }

        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        // No se añade el filtro de status aquí.
        const response = await axios.get(`${API_URL}/report?${params.toString()}`, getAuthHeader(token));
        return response.data;
    }, [token]);

    const create = useCallback(async (transactionData) => {
        const response = await axios.post(API_URL, transactionData, getAuthHeader(token));
        return response.data;
    }, [token]);

    const update = useCallback(async ({ id, data }) => {
        const response = await axios.patch(`${API_URL}/${id}`, data, getAuthHeader(token));
        return response.data;
    }, [token]);

    const deleteById = useCallback(async (id) => {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader(token));
    }, [token]);

    const apply = useCallback(async (id) => {
        const response = await axios.post(`${API_URL}/${id}/apply`, null, getAuthHeader(token));
        return response.data;
    }, [token]);

    const cancel = useCallback(async (id) => {
        const response = await axios.post(`${API_URL}/${id}/cancel`, null, getAuthHeader(token));
        return response.data;
    }, [token]);

    return {
        getAll,
        getById,
        search,
        create,
        update,
        delete: deleteById, // Mapeado para DocumentListView
        approve: apply,     // Mapeado para DocumentListView
        cancel
    };
};