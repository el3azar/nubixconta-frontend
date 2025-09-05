import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:8080/api/v1/customers";

const useCustomerService = () => {
  const { token } = useAuth();

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Obtener todos los clientes (se usará en la búsqueda)
  const searchCustomers = async (filters) => {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader());
    return res.data;
  };

  const getInactiveCustomers = async () => {
    const res = await axios.get(`${API_URL}/inactive`, getAuthHeader());
    return res.data;
  };

  const getCustomerById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  };

  const createCustomer = async (customerData) => {
    const res = await axios.post(API_URL, customerData, getAuthHeader());
    return res.data;
  };

  // Actualizar cliente (PATCH). Recibe un payload con solo los campos cambiados.
  const updateCustomer = async ({ id, payload }) => {
    const res = await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
    return res.data;
  };

  // --- CAMBIO CLAVE: Desactivar cliente llama a su propio endpoint ---
  const desactivateCustomer = async (id) => {
    // La petición PATCH no necesita un cuerpo (payload), la acción está en la URL.
    const res = await axios.post(`${API_URL}/${id}/deactivate`, null, getAuthHeader());
    return res.data; // El backend devuelve 204, pero retornamos por consistencia en React Query.
  };

  // --- CAMBIO CLAVE: Reactivar cliente llama a su propio endpoint ---
  const reactivateCustomer = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/activate`, null, getAuthHeader());
    return res.data;
  };

  return {
    searchCustomers,
    getInactiveCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    desactivateCustomer,
    reactivateCustomer,
  };
};

export { useCustomerService };