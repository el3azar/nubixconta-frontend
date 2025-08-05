import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// URL base para notas de crédito
const API_URL = "http://localhost:8080/api/v1/credit-notes";

// Función para incluir el JWT en las peticiones (reutilizada)
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook personalizado que expone las funciones del módulo de notas de crédito.
 *  - Uso: const creditNoteService = useCreditNoteService();
 *  - Todas las funciones devuelven Promesas (async/await).
 */
export const CreditNoteService = () => {
  const { token } = useAuth();

  // ============================
  //      MÉTODOS PRINCIPALES
  // ============================

  /**
   * Obtiene todas las notas de crédito con un ordenamiento específico.
   * @param {string} [sortBy='status'] - Criterio de ordenamiento ('status' o 'date').
   * @returns {Promise<Array>} Lista de notas de crédito ordenadas.
   */
  const getAllCreditNotes = async (sortBy = 'status') => {
    // Usamos el objeto `params` de Axios para construir la URL de forma segura.
    const response = await axios.get(API_URL, {
      ...getAuthHeader(token),
      params: { sortBy },
    });
    return response.data;
  };

  /**
   * Elimina una nota de crédito (solo si está en estado PENDIENTE).
   * @param {number} creditNoteId - El ID de la nota de crédito a eliminar.
   * @returns {Promise<void>}
   */
  const deleteCreditNote = async (creditNoteId) => {
    await axios.delete(`${API_URL}/${creditNoteId}`, getAuthHeader(token));
  };

  /**
   * Aplica una nota de crédito (la pasa a estado APLICADA).
   * @param {number} creditNoteId
   * @returns {Promise<Object>} Nota de crédito actualizada.
   */
  const applyCreditNote = async (creditNoteId) => {
    const response = await axios.post(`${API_URL}/${creditNoteId}/apply`, null, getAuthHeader(token));
    return response.data;
  };

  /**
   * Anula una nota de crédito (la pasa a estado ANULADA).
   * @param {number} creditNoteId
   * @returns {Promise<Object>} Nota de crédito actualizada.
   */
  const cancelCreditNote = async (creditNoteId) => {
    const response = await axios.post(`${API_URL}/${creditNoteId}/cancel`, null, getAuthHeader(token));
    return response.data;
  };

  // ============================
  //      MÉTODOS DE CREACIÓN Y EDICIÓN
  // ============================

  /**
   * Crea una nueva nota de crédito.
   * @param {Object} creditNoteData (CreditNoteCreateDTO)
   * @returns {Promise<Object>} La nota de crédito creada.
   */
  const createCreditNote = async (creditNoteData) => {
    const response = await axios.post(API_URL, creditNoteData, getAuthHeader(token));
    return response.data;
  };

  /**
   * Edita parcialmente una nota de crédito.
   * @param {number} creditNoteId
   * @param {Object} updates (CreditNoteUpdateDTO)
   * @returns {Promise<Object>} La nota de crédito actualizada.
   */
  const updateCreditNote = async (creditNoteId, updates) => {
    const response = await axios.patch(`${API_URL}/${creditNoteId}`, updates, getAuthHeader(token));
    return response.data;
  };


  // ============================
  //      MÉTODOS DE BÚSQUEDA
  // ============================

  /**
   * Obtiene una nota de crédito específica por su ID.
   * @param {number} creditNoteId
   * @returns {Promise<Object>} La nota de crédito detallada.
   */
  const getCreditNoteById = async (creditNoteId) => {
    const response = await axios.get(`${API_URL}/${creditNoteId}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Busca notas de crédito asociadas a una venta específica.
   * @param {number} saleId
   * @returns {Promise<Array>} Lista de notas de crédito encontradas.
   */
  const findCreditNotesBySaleId = async (saleId) => {
    const response = await axios.get(`${API_URL}/by-sale/${saleId}`, getAuthHeader(token));
    return response.data;
  };
  
  /**
   * Busca notas de crédito por rango de fechas y opcionalmente por estado.
   * @param {Object} params - Objeto con { start, end, status? }. Fechas en formato YYYY-MM-DD.
   * @returns {Promise<Array>} Lista filtrada de notas de crédito.
   */
  const searchByDateAndStatus = async ({ start, end, status }) => {
    const searchParams = { start, end };
    if (status) {
      searchParams.status = status;
    }
    const response = await axios.get(`${API_URL}/search`, { 
        ...getAuthHeader(token),
        params: searchParams 
    });
    return response.data;
  };

  /**
   * Busca notas de crédito por un estado específico.
   * @param {string} status - El estado a buscar (PENDIENTE, APLICADA, ANULADA).
   * @returns {Promise<Array>} Lista de notas de crédito con ese estado.
   */
  const findByStatus = async (status) => {
      const response = await axios.get(`${API_URL}/by-status`, {
          ...getAuthHeader(token),
          params: { status }
      });
      return response.data;
  };


  // Devuelve todos los métodos que necesita el módulo de notas de crédito
  return {
    getAllCreditNotes,
    deleteCreditNote,
    applyCreditNote,
    cancelCreditNote,
    createCreditNote,
    updateCreditNote,
    getCreditNoteById,
    findCreditNotesBySaleId,
    searchByDateAndStatus,
    findByStatus,
  };
};

export default CreditNoteService;