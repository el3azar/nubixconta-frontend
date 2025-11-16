import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/products`;

// Este es el hook principal que usarán tus componentes.
export const useProductService = () => {
  const { token } = useAuth();

  // Función de ayuda para no repetir la configuración de cabeceras.
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // --- MÉTODOS DE LECTURA (GET) ---

  // Obtener todos los productos (activos e inactivos) de la empresa actual
  const findAllProducts = async () => {
    const res = await axios.get(API_URL, getAuthHeader());
    return res.data;
  };
  
  // Obtener solo productos activos de la empresa actual (ya ordenados por nombre desde el backend)
  const findActiveProducts = async () => {
    const res = await axios.get(`${API_URL}/active`, getAuthHeader());
    return res.data;
  };
  
  // Obtener solo productos inactivos de la empresa actual
  const findInactiveProducts = async () => {
    const res = await axios.get(`${API_URL}/inactive`, getAuthHeader());
    return res.data;
  };

  // Búsqueda flexible de productos activos
  const searchActiveProducts = async (filters) => {
    // Limpiamos los filtros para no enviar parámetros vacíos
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== '')
    );
    const params = new URLSearchParams(activeFilters);
    const res = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader());
    return res.data;
  };

  // Obtener un producto por su ID
  const findProductById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  };

  // Obtener un producto por su código
  const findProductByCode = async (code) => {
    const res = await axios.get(`${API_URL}/by-code/${code}`, getAuthHeader());
    return res.data;
  };


  // --- MÉTODOS DE ESCRITURA (POST, PATCH, DELETE) ---

  // Crear un nuevo producto
  const createProduct = async (productData) => {
    // El productData debe coincidir con el DTO del backend (productCode, productName, etc.)
    const res = await axios.post(API_URL, productData, getAuthHeader());
    return res.data;
  };

  // Actualizar un producto (usa PATCH para actualizaciones parciales)
  const updateProduct = async ({ id, payload }) => {
    // El payload debe coincidir con el ProductUpdateDTO (productCode, productName, unit, productStatus)
    const res = await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
    return res.data;
  };

  // Desactivar un producto (un caso específico de update)
  const deactivateProduct = async (id) => {
   // La petición POST no necesita un cuerpo, la acción está en la URL.
    const res = await axios.post(`${API_URL}/${id}/deactivate`, null, getAuthHeader());
    return res.data; // El backend devuelve el producto actualizado.
  };
  
  // Reactivar un producto (un caso específico de update, para consistencia con customerService)
  const reactivateProduct = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/activate`, null, getAuthHeader());
    return res.data; // El backend devuelve el producto actualizado.
  };



  // Objeto que devuelve el hook con todas las funciones listas para usar
  return {
    findAllProducts,
    findActiveProducts,
    findInactiveProducts,
    searchActiveProducts,
    findProductById,
    findProductByCode,
    createProduct,
    updateProduct,
    deactivateProduct,
    reactivateProduct,
  };
};