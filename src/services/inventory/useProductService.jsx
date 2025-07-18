import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:8080/api/v1/products";

// Configura los headers con el token
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const useProductService = () => {
  const { token } = useAuth();

  // Obtener todos los productos (activos e inactivos)
  const getAllProducts = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al obtener todos los productos:", error);
      throw error;
    }
  };

  // Obtener productos activos
  const getActiveProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/active`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      throw error;
    }
  };

  // Obtener productos inactivos
  const getInactiveProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/inactive`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al obtener productos inactivos:", error);
      throw error;
    }
  };

  // Buscar productos activos por id, código o nombre
  const searchActiveProducts = async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      const res = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al buscar productos activos:", error);
      throw error;
    }
  };

  // Obtener producto por ID
  const getProductById = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  };

  // Obtener producto por código
  const getProductByCode = async (code) => {
    try {
      const res = await axios.get(`${API_URL}/by-code/${code}`, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error(`Error al obtener producto por código ${code}:`, error);
      throw error;
    }
  };

  // Crear nuevo producto
  const createProduct = async (productData) => {
    try {
      const res = await axios.post(API_URL, productData, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  };

  // Actualizar producto (PATCH con campos parciales)
  const updateProduct = async (id, updates) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, updates, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  };

  // Desactivar producto (solo cambia `productStatus` a false)
  const deactivateProduct = async (id) => {
    try {
      const updates = { productStatus: false };
      const res = await axios.patch(`${API_URL}/${id}`, updates, getAuthHeader(token));
      return res.data;
    } catch (error) {
      console.error("Error al desactivar producto:", error);
      throw error;
    }
  };

  return {
    getAllProducts,
    getActiveProducts,
    getInactiveProducts,
    searchActiveProducts,
    getProductById,
    getProductByCode,
    createProduct,
    updateProduct,
    deactivateProduct,
  };
};

export { useProductService };
