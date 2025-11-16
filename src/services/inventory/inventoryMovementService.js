import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/inventory-movements`;

export const useInventoryMovementService = () => {
  const { token } = useAuth();

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // --- MÉTODOS DE LECTURA (GET) ---

  /**
   * Obtiene la lista de todos los movimientos, con ordenamiento.
   * @param {string} sortBy - 'status' (default) o 'date'.
   */
  const findAllMovements = async (sortBy = 'status') => {
    const params = new URLSearchParams({ sortBy });
    const res = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
    return res.data;
  };

  /**
   * Obtiene movimientos filtrados por un rango de fechas.
   * @param {object} filters - { startDate, endDate }
   */
  const findMovementsByDateRange = async (filters) => {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`${API_URL}/by-date-range?${params.toString()}`, getAuthHeader());
    return res.data;
  };


  // --- MÉTODOS DE ESCRITURA (POST, PATCH, DELETE) para movimientos MANUALES ---
  
  const createManualMovement = async (movementData) => {
    const res = await axios.post(`${API_URL}/manual`, movementData, getAuthHeader());
    return res.data;
  };

  const updateManualMovement = async ({ id, payload }) => {
    const res = await axios.patch(`${API_URL}/manual/${id}`, payload, getAuthHeader());
    return res.data;
  };
  
  const deleteManualMovement = async (id) => {
    await axios.delete(`${API_URL}/manual/${id}`, getAuthHeader());
    // DELETE exitoso no devuelve contenido, así que no hay 'res.data'
  };

  // --- ACCIONES DE ESTADO (APLICAR, ANULAR) ---
  
  const applyMovement = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/apply`, {}, getAuthHeader());
    return res.data;
  };

  const cancelMovement = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/cancel`, {}, getAuthHeader());
    return res.data;
  };


  return {
    findAllMovements,
    findMovementsByDateRange,
    createManualMovement,
    updateManualMovement,
    deleteManualMovement,
    applyMovement,
    cancelMovement,
  };
};