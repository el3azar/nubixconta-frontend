import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// URL base para el módulo de compras
const API_URL = "http://localhost:8080/api/v1/purchases";

// Función helper para incluir el JWT en las peticiones (idéntica a la de ventas)
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook personalizado que expone las funciones del API del módulo de compras.
 *  - Uso: const purchaseService = usePurchaseService();
 *  - Todas las funciones devuelven Promesas (están diseñadas para async/await).
 *  - Es un espejo funcional de SaleService.jsx
 */
export const usePurchaseService = () => {
  const { token } = useAuth();

  // ============================
  //      MÉTODOS DE CONSULTA
  // ============================

  /**
   * Obtiene todas las compras con un ordenamiento específico.
   * @param {string} sortBy - Criterio ('status' o 'date').
   * @returns {Promise<Array>} Lista de compras.
   */
  const getAllPurchases = async (sortBy = 'status') => {
    const response = await axios.get(`${API_URL}?sortBy=${sortBy}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Obtiene una compra específica por su ID.
   * @param {number} purchaseId - El ID de la compra.
   * @returns {Promise<Object>} La compra detallada.
   */
  const getPurchaseById = async (purchaseId) => {
    const response = await axios.get(`${API_URL}/${purchaseId}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Busca compras para reportes usando criterios combinados.
   * @param {Object} filters - Objeto con { startDate, endDate, supplierName, supplierLastName }.
   * @returns {Promise<Array>} Lista de compras filtradas.
   */
  const searchPurchasesByCriteria = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.supplierName) params.append('supplierName', filters.supplierName);
    if (filters.supplierLastName) params.append('supplierLastName', filters.supplierLastName);

    const response = await axios.get(`${API_URL}/report?${params.toString()}`, getAuthHeader(token));
    return response.data;
  };

  // ============================
  //      MÉTODOS DE MUTACIÓN
  // ============================

  /**
   * Crea una nueva compra.
   * @param {Object} purchaseData - El objeto PurchaseCreateDTO.
   * @returns {Promise<Object>} La compra creada.
   */
  const createPurchase = async (purchaseData) => {
    const response = await axios.post(API_URL, purchaseData, getAuthHeader(token));
    return response.data;
  };

  /**
   * Actualiza parcialmente una compra existente.
   * @param {number} purchaseId - El ID de la compra a actualizar.
   * @param {Object} updates - El objeto PurchaseUpdateDTO.
   * @returns {Promise<Object>} La compra actualizada.
   */
  const updatePurchase = async (purchaseId, updates) => {
    const response = await axios.patch(`${API_URL}/${purchaseId}`, updates, getAuthHeader(token));
    return response.data;
  };

  /**
   * Elimina una compra (solo si está en estado PENDIENTE).
   * @param {number} purchaseId - El ID de la compra a eliminar.
   */
  const deletePurchase = async (purchaseId) => {
    await axios.delete(`${API_URL}/${purchaseId}`, getAuthHeader(token));
  };


  // ===================================
  //      MÉTODOS DE CAMBIO DE ESTADO
  // ===================================

  /**
   * Aplica una compra (la pasa a estado APLICADA).
   * @param {number} purchaseId - El ID de la compra.
   * @returns {Promise<Object>} La compra actualizada.
   */
  const applyPurchase = async (purchaseId) => {
    // Corresponde al endpoint POST /api/v1/purchases/{id}/apply
    const response = await axios.post(`${API_URL}/${purchaseId}/apply`, null, getAuthHeader(token));
    return response.data;
  };

  /**
   * Anula una compra (la pasa a estado ANULADA).
   * @param {number} purchaseId - El ID de la compra.
   * @returns {Promise<Object>} La compra actualizada.
   */
  const cancelPurchase = async (purchaseId) => {
    // Corresponde al endpoint POST /api/v1/purchases/{id}/cancel
    const response = await axios.post(`${API_URL}/${purchaseId}/cancel`, null, getAuthHeader(token));
    return response.data;
  };

  // ===================================
  //      MÉTODOS RELACIONADOS
  // ===================================

  /**
   * Obtiene el asiento contable de una compra.
   * @param {number} purchaseId - El ID de la compra.
   * @returns {Promise<Object>} El DTO del asiento contable.
   */
  const getPurchaseAccountingEntry = async (purchaseId) => {
    const response = await axios.get(`${API_URL}/${purchaseId}/accounting-entry`, getAuthHeader(token));
    return response.data;
  };

  // Exponemos todas las funciones para que puedan ser utilizadas en los componentes.
  return {
    getAllPurchases,
    getPurchaseById,
    searchPurchasesByCriteria,
    createPurchase,
    updatePurchase,
    deletePurchase,
    applyPurchase,
    cancelPurchase,
    getPurchaseAccountingEntry,
  };
};