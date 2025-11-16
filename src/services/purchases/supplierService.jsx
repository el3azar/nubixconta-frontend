import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// 1. CAMBIO CLAVE: Apuntamos al endpoint de proveedores.
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/suppliers`;

/**
 * Hook personalizado para encapsular toda la lógica de comunicación
 * con la API de Proveedores.
 * Sigue el mismo patrón que useCustomerService.
 */
const useSupplierService = () => {
  // Obtenemos el token del contexto de autenticación.
  // Este token ya tiene el scope de la empresa seleccionada.
  const { token } = useAuth();

  // Función helper para no repetir la configuración de cabeceras.
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 2. ADAPTACIÓN: Todas las funciones se renombran de 'Customer' a 'Supplier'.
  // La lógica interna (axios.get, axios.post, etc.) es idéntica.

  /**
   * Busca proveedores activos basado en un objeto de filtros.
   * @param {object} filters - Ej: { name: 'Mi Proveedor', nit: '1234-...' }
   * @returns {Promise<Array>} - Una lista de proveedores.
   */
  const searchSuppliers = async (filters) => {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`${API_URL}/search?${params.toString()}`, getAuthHeader());
    return res.data;
  };

  /**
   * Obtiene la lista de proveedores inactivos.
   */
  const getInactiveSuppliers = async () => {
    const res = await axios.get(`${API_URL}/inactive`, getAuthHeader());
    return res.data;
  };

  /**
   * Obtiene los datos de un único proveedor por su ID.
   * @param {number} id - El ID del proveedor.
   */
  const getSupplierById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  };

  /**
   * Crea un nuevo proveedor.
   * @param {object} supplierData - El objeto proveedor que cumple con SupplierCreateDTO.
   */
  const createSupplier = async (supplierData) => {
    const res = await axios.post(API_URL, supplierData, getAuthHeader());
    return res.data;
  };

  /**
   * Actualiza un proveedor existente.
   * @param {object} params - Un objeto que contiene el ID y el payload.
   * @param {number} params.id - El ID del proveedor a actualizar.
   * @param {object} params.payload - El objeto con los campos a cambiar (SupplierUpdateDTO).
   */
  const updateSupplier = async ({ id, payload }) => {
    const res = await axios.patch(`${API_URL}/${id}`, payload, getAuthHeader());
    return res.data;
  };

  /**
   * Desactiva un proveedor por su ID.
   * @param {number} id - El ID del proveedor a desactivar.
   */
  const desactivateSupplier = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/deactivate`, null, getAuthHeader());
    return res.data;
  };

  /**
   * Reactiva un proveedor por su ID.
   * @param {number} id - El ID del proveedor a reactivar.
   */
  const reactivateSupplier = async (id) => {
    const res = await axios.post(`${API_URL}/${id}/activate`, null, getAuthHeader());
    return res.data;
  };

  // 3. Devolvemos el objeto con todas las funciones del servicio.
  return {
    search: searchSuppliers,
    getInactive: getInactiveSuppliers,
    getById: getSupplierById,
    create: createSupplier,
    update: updateSupplier,
    desactivate: desactivateSupplier,
    reactivate: reactivateSupplier,
  };
};

export { useSupplierService };