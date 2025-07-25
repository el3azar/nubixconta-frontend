
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// URL base para ventas
const API_URL = "http://localhost:8080/api/v1/sales";

// Función para incluir el JWT en las peticiones
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook personalizado que expone las funciones del módulo de ventas.
 *  - Puedes usarlo como: const saleService = useSaleService();
 *  - Todas las funciones devuelven Promesas (async/await).
 */
export const SaleService = () => {
  const { token } = useAuth();

  // ============================
  //      MÉTODOS PRINCIPALES
  // ============================

/**
 * Obtiene todas las ventas con un ordenamiento específico.
 * @param {string} sortBy - Criterio de ordenamiento ('status' o 'date').
 * @returns {Promise<Array>} Lista de ventas ordenadas.
 */
const getAllSales = async (sortBy = 'status') => { // Acepta el parámetro, con 'status' por defecto.
  const response = await axios.get(`${API_URL}?sortBy=${sortBy}`, getAuthHeader(token));
  return response.data;
};

  /**
   * Busca ventas dentro de un rango de fechas (por filtro)
   * @param {Object} param0 {startDate, endDate} en formato YYYY-MM-DD
   * @returns {Promise<Array>} Lista filtrada
   */
  const searchSalesByDate = async ({ startDate, endDate }) => {
    // ¡OJO! Los parámetros del backend son start y end, NO startDate/endDate.
    const response = await axios.get(
      `${API_URL}/search?start=${startDate}&end=${endDate}`,
      getAuthHeader(token)
    );
    return response.data;
  };

  /**
   * Elimina una venta (solo si está en estado PENDIENTE)
   * @param {number} saleId
   */
  const deleteSale = async (saleId) => {
    await axios.delete(`${API_URL}/${saleId}`, getAuthHeader(token));
  };

  /**
   * Aprueba una venta (la pasa a estado APLICADA, reglas de crédito, inventario, etc.)
   * @param {number} saleId
   * @returns {Promise<Object>} Venta actualizada
   */
  const approveSale = async (saleId) => {
    // Usa el endpoint /apply (POST), no PATCH
    const response = await axios.post(`${API_URL}/${saleId}/apply`, null, getAuthHeader(token));
    return response.data;
  };

  /**
   * Anula una venta (la pasa a estado ANULADA, revierte inventario, saldo, etc.)
   * @param {number} saleId
   * @returns {Promise<Object>} Venta actualizada
   */
  const cancelSale = async (saleId) => {
    // Usa el endpoint /cancel (POST), no PATCH
    const response = await axios.post(`${API_URL}/${saleId}/cancel`, null, getAuthHeader(token));
    return response.data;
  };

  // ============================
  //      OTROS MÉTODOS ÚTILES
  // ============================

  /**
   * Obtiene una venta específica por ID
   * @param {number} saleId
   * @returns {Promise<Object>} Venta detallada
   */
  const getSaleById = async (saleId) => {
    const response = await axios.get(`${API_URL}/${saleId}`, getAuthHeader(token));
    return response.data;
  };
  /**
   * Busca y devuelve todas las ventas en estado 'APLICADA' para un cliente específico.
   * y que no tenga una nota de crédito asociada en estado PENDIENTE o APLICADA.
   * @param {number} clientId - El ID del cliente.
   * @returns {Promise<Array>} Una lista de ventas aplicadas del cliente.
   */
  const getAppliedSalesByCustomer = async (clientId) => {
    const response = await axios.get(`${API_URL}/customer/${clientId}/available-for-credit-note`, getAuthHeader(token));
    return response.data;
  };
  /**
   * Crea una nueva venta
   * @param {Object} saleData (SaleCreateDTO)
   * @returns {Promise<Object>} Venta creada
   */
  const createSale = async (saleData) => {
    const response = await axios.post(API_URL, saleData, getAuthHeader(token));
    return response.data;
  };

  /**
   * Edita parcialmente una venta
   * @param {number} saleId
   * @param {Object} updates (SaleUpdateDTO)
   * @returns {Promise<Object>} Venta actualizada
   */
  const updateSale = async (saleId, updates) => {
    const response = await axios.patch(`${API_URL}/${saleId}`, updates, getAuthHeader(token));
    return response.data;
  };

  //Búsqueda por cliente, por si implementas esa vista
  const searchSalesByCustomer = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await axios.get(`${API_URL}/client-search?${params}`, getAuthHeader(token));
    return response.data;
  };

  // (Opcional) Obtener detalles de venta si lo usas en otra vista
  const getSaleDetailsBySaleId = async (saleId) => {
    const response = await axios.get(`${API_URL}/${saleId}/details`, getAuthHeader(token));
    return response.data;
  };

  // Devuelve todos los métodos que necesita el módulo de ventas
  return {
    getAllSales,
    searchSalesByDate,
    deleteSale,
    approveSale,
    cancelSale,
    getSaleById,
    createSale,
    getAppliedSalesByCustomer,
    updateSale,
    searchSalesByCustomer,    // Solo si implementas búsqueda avanzada
    getSaleDetailsBySaleId,   // Solo si necesitas mostrar detalles por separado
  };
};

export default SaleService;

