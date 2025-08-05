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

  // Desactivar cliente (PATCH status a false)
  const desactivateCustomer = async (id) => {
    return updateCustomer({ id, payload: { status: false } });
  };

  // Reactivar cliente (PATCH status a true)
  const reactivateCustomer = async (id) => {
    return updateCustomer({ id, payload: { status: true } });
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