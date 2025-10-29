// src/services/banksService.js
import api from '../api'; // Importa la instancia de Axios configurada

// --- YA NO NECESITAMOS LA FUNCIÓN toApiDate ---

// -------------------------------------------------------------
// --- SERVICIOS DEL MÓDULO DE BANCOS ---
// -------------------------------------------------------------

/**
 * Obtiene la lista de transacciones bancarias (con filtros opcionales).
 * @param {object} filters - Objeto con filtros: { idCatalog, dateFrom, dateTo }
 * @param {string} [filters.dateFrom] - Fecha en formato 'YYYY-MM-DD'
 * @param {string} [filters.dateTo] - Fecha en formato 'YYYY-MM-DD'
 */
const listAllTransactions = (filters = {}) => {
  // 1. Prepara los parámetros (¡ya no hay conversión!)
  const params = {
    idCatalog: filters.idCatalog,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };

  // 2. Limpia los parámetros que sean nulos o vacíos
  Object.keys(params).forEach(key => {
    if (!params[key]) {
      delete params[key];
    }
  });

  return api.get("/bank-transactions", { params }).then(response => response.data);
};

/**
 * Obtiene una sola transacción por su ID.
 * @param {number} id - El ID de la transacción.
 */
const getTransactionById = (id) => {
  return api.get(`/bank-transactions/${id}`).then(response => response.data);
};

/**
 * Crea una nueva transacción bancaria.
 * @param {object} transactionData - El DTO de la transacción desde el formulario.
 */
const createTransaction = (transactionData) => {
  // El DTO (incluyendo transactionData.transactionDate) debe venir en 'YYYY-MM-DD'
  return api.post("/bank-transactions", transactionData).then(response => response.data);
};

/**
 * Actualiza una transacción bancaria.
 * @param {number} id - El ID de la transacción a actualizar.
 * @param {object} transactionData - El DTO con los campos a actualizar.
 */
const updateTransaction = (id, transactionData) => {
  return api.put(`/bank-transactions/${id}`, transactionData).then(response => response.data);
};

/**
 * Elimina una transacción bancaria por ID.
 * @param {number} id - El ID de la transacción a eliminar.
 */
const deleteTransaction = (id) => {
  return api.delete(`/bank-transactions/${id}`).then(response => response.data);
};

/**
 * Aplica una transacción (cambia estado a 'APLICADA').
 * @param {number} id - El ID de la transacción a aplicar.
 */
const applyTransaction = (id) => {
  return api.post(`/bank-transactions/${id}/apply`).then(response => response.data);
};

/**
 * Anula una transacción (cambia estado a 'ANULADA').
 * @param {number} id - El ID de la transacción a anular.
 */
const annulTransaction = (id) => {
    return api.post(`/bank-transactions/${id}/annul`).then(response => response.data);
};

// --- Exportamos todas las funciones en un solo objeto ---
export const bankTransactionService = {
  listAll: listAllTransactions,
  getById: getTransactionById,
  create: createTransaction,
  update: updateTransaction,
  delete: deleteTransaction,
  apply: applyTransaction,
  annul: annulTransaction
};