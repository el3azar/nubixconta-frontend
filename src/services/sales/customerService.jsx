import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:8080/api/v1/customers";

// Configura los headers con el token
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const useCustomerService = () => {
  const { token } = useAuth();

  // Obtener todos los clientes
  const getAllCustomers = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al obtener todos los clientes:", error);
      throw error;
    }
  };

  // Buscar clientes activos con filtros
  const searchCustomers = async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al buscar clientes:", error);
      throw error;
    }
  };

  // Obtener clientes desactivados
  const getInactiveCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/inactive`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al obtener clientes desactivados:", error);
      throw error;
    }
  };

 // Crear nuevo cliente
  const createCustomer = async (customerData) => {
    try {
      const res = await axios.post(API_URL, customerData, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al crear cliente:", error);
      throw error;
    }
  };
  // Actualizar cliente (PATCH)
const updateCustomer = async (id, updates) => {
  try {
    const res = await axios.patch(`${API_URL}/${id}`, updates, getAuthHeader(token));
    return res.data;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

// Desactivar cliente (solo cambia `status` a false)
const desactivateCustomer = async (id) => {
  try {
    const updates = { status: false };
    const res = await axios.patch(`${API_URL}/${id}`, updates, getAuthHeader(token));
    return res.data;
  } catch (error) {
    console.error("Error al desactivar cliente:", error);
    throw error;
  }
};
const getCustomerById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader(token));
    return res.data;
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
    throw error;
  }
};

  return {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    getInactiveCustomers,
    createCustomer, 
    updateCustomer,
   desactivateCustomer,
  };
};

export { useCustomerService };