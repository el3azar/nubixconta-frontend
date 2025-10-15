// src/services/purchases/PurchaseCreditNoteService.jsx

import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// URL base para el módulo de Notas de Crédito de Compras
const API_URL = "http://localhost:8080/api/v1/purchase-credit-notes";

// Función helper para incluir el JWT en las peticiones (reutilizada)
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook personalizado que expone las funciones del API del módulo de Notas de Crédito sobre Compras.
 */
export const usePurchaseCreditNoteService = () => {
  const { token } = useAuth();

  // ============================
  //      MÉTODOS DE CONSULTA
  // ============================

  const getAll = async (sortBy = 'status') => {
    const response = await axios.get(`${API_URL}?sortBy=${sortBy}`, getAuthHeader(token));
    return response.data;
  };

  const getById = async (creditNoteId) => {
    const response = await axios.get(`${API_URL}/${creditNoteId}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Busca notas de crédito de compra usando filtros.
   * Llama al nuevo endpoint GET /api/v1/purchase-credit-notes/search.
   * @param {Object} filters - Objeto con { startDate, endDate }.
   * @returns {Promise<Array>} Lista de notas de crédito filtradas.
   */
  const search = async (filters = {}) => {
    // Si no hay filtros, no hacemos la llamada.
    if (!filters.startDate || !filters.endDate) {
      return Promise.resolve([]);
    }

    // Usamos URLSearchParams para construir la query string de forma segura.
    const params = new URLSearchParams();
    params.append('start', filters.startDate);
    params.append('end', filters.endDate);
    
    // Si en el futuro añades un filtro de estado en la UI, puedes añadirlo aquí:
    // if (filters.status) params.append('status', filters.status);

    const response = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader(token));
    return response.data;
  };

  // ============================
  //      MÉTODOS DE MUTACIÓN
  // ============================

  const create = async (creditNoteData) => {
    const response = await axios.post(API_URL, creditNoteData, getAuthHeader(token));
    return response.data;
  };

  // El DocumentListView espera que el parámetro de la mutación sea un objeto
  const update = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data, getAuthHeader(token));
    return response.data;
  };

  // Mapeamos a 'deleteById' para claridad interna, pero lo exportamos como 'delete'.
  const deleteById = async (creditNoteId) => {
    await axios.delete(`${API_URL}/${creditNoteId}`, getAuthHeader(token));
  };

  // ===================================
  //      MÉTODOS DE CAMBIO DE ESTADO
  // ===================================

  const approve = async (creditNoteId) => {
    const response = await axios.post(`${API_URL}/${creditNoteId}/apply`, null, getAuthHeader(token));
    return response.data;
  };

  const cancel = async (creditNoteId) => {
    const response = await axios.post(`${API_URL}/${creditNoteId}/cancel`, null, getAuthHeader(token));
    return response.data;
  };

  // ===================================
  //      MÉTODOS RELACIONADOS
  // ===================================

  const getAccountingEntry = async (creditNoteId) => {
    const response = await axios.get(`${API_URL}/${creditNoteId}/accounting-entry`, getAuthHeader(token));
    return response.data;
  };
  
  // Exponemos las funciones con los nombres que DocumentListView espera.
  return {
    getAll,
    getById,
    search,
    create,
    update,
    delete: deleteById,
    approve,
    cancel,
    getAccountingEntry,
  };
};