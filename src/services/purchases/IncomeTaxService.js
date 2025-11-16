// src/services/purchases/IncomeTaxService.js

import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// URL base para el módulo de Retenciones de ISR
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/income-taxes`;

// Función helper para incluir el JWT en las peticiones (reutilizada)
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Hook personalizado que expone las funciones del API del módulo de Retenciones de ISR.
 */
export const useIncomeTaxService = () => {
  const { token } = useAuth();

  // ============================
  //      MÉTODOS DE CONSULTA
  // ============================

  /**
   * Obtiene todas las retenciones con un ordenamiento específico.
   * @param {string} sortBy - Criterio de ordenamiento ('status' o 'date').
   * @returns {Promise<Array>} Lista de retenciones.
   */
  const getAll = async (sortBy = 'status') => {
    const response = await axios.get(`${API_URL}?sortBy=${sortBy}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Obtiene una retención específica por su ID.
   * @param {number} id - El ID de la retención.
   * @returns {Promise<Object>} La retención detallada (IncomeTaxResponseDTO).
   */
  const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader(token));
    return response.data;
  };

  /**
   * Busca retenciones de ISR usando filtros de fecha.
   * Este método es necesario para la compatibilidad con el componente DocumentListView.
   * @param {Object} filters - Objeto con { startDate, endDate }.
   * @returns {Promise<Array>} Lista de retenciones filtradas.
   */
  const search = async (filters = {}) => {
    // Se requiere al menos una fecha para la búsqueda
    if (!filters.startDate && !filters.endDate) {
      return Promise.resolve([]);
    }

    const params = new URLSearchParams();
    // Añadimos los parámetros solo si existen
    if (filters.startDate) params.append('start', filters.startDate);
    if (filters.endDate) params.append('end', filters.endDate);
    
    // --- CAMBIO CLAVE AQUÍ: Se ha añadido "/search" a la URL ---
    // Ahora la petición se enviará al endpoint correcto que sí entiende los filtros de fecha.
    const response = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader(token));
    return response.data;
  };

  // ============================
  //      MÉTODOS DE MUTACIÓN
  // ============================

  /**
   * Crea una nueva retención de ISR.
   * @param {Object} incomeTaxData - El DTO IncomeTaxCreateDTO.
   * @returns {Promise<Object>} La retención creada.
   */
  const create = async (incomeTaxData) => {
    const response = await axios.post(API_URL, incomeTaxData, getAuthHeader(token));
    return response.data;
  };

  /**
   * Actualiza una retención de ISR existente (solo si está PENDIENTE).
   * @param {Object} params - Objeto que contiene el ID y los datos a actualizar.
   * @param {number} params.id - El ID de la retención.
   * @param {Object} params.data - El DTO IncomeTaxUpdateDTO.
   * @returns {Promise<Object>} La retención actualizada.
   */
  const update = async ({ id, data }) => {
    const response = await axios.patch(`${API_URL}/${id}`, data, getAuthHeader(token));
    return response.data;
  };

  /**
   * Elimina una retención de ISR (solo si está PENDIENTE).
   * @param {number} id - El ID de la retención a eliminar.
   */
  const deleteById = async (id) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader(token));
  };


  // ===================================
  //      MÉTODOS DE CAMBIO DE ESTADO
  // ===================================

  /**
   * Aplica una retención (la pasa a estado APLICADA).
   * @param {number} id - El ID de la retención.
   * @returns {Promise<Object>} La retención actualizada.
   */
  const approve = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/apply`, null, getAuthHeader(token));
    return response.data;
  };

  /**
   * Anula una retención (la pasa a estado ANULADA).
   * @param {number} id - El ID de la retención.
   * @returns {Promise<Object>} La retención actualizada.
   */
  const cancel = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/cancel`, null, getAuthHeader(token));
    return response.data;
  };


  // ===================================
  //      MÉTODOS RELACIONADOS
  // ===================================

  /**
   * Obtiene el asiento contable de una retención.
   * @param {number} id - El ID de la retención.
   * @returns {Promise<Object>} El DTO del asiento contable.
   */
  const getAccountingEntry = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/accounting-entry`, getAuthHeader(token));
    return response.data;
  };
  
  // Exponemos las funciones con los nombres que DocumentListView espera.
  return {
    getAll,
    getById,
    search,
    create,
    update,
    delete: deleteById, // Se renombra `deleteById` a `delete` para compatibilidad.
    approve,
    cancel,
    getAccountingEntry,
  };
};