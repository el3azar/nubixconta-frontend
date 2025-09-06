import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductService } from "../services/inventory/productService";
import { useCompany } from "../context/CompanyContext";
import { Notifier } from "../utils/alertUtils";
/**
 * Hook central para todas las operaciones de React Query relacionadas con Productos.
 */

// =================================================================
// == HOOKS DE LECTURA (QUERIES)
// =================================================================

/**
 * Obtiene la lista de productos ACTIVOS para la empresa actual.
 * La lista se actualiza automáticamente si la empresa cambia.
 * @returns El resultado de la consulta de useQuery.
 */
export const useActiveProducts = () => {
  const { findActiveProducts } = useProductService();
  const { company } = useCompany();

  return useQuery({
    // La clave de la consulta es crucial. Incluye el nombre del módulo, la empresa y el filtro.
    // React Query volverá a ejecutar la consulta si esta clave cambia.
    queryKey: ["products", company?.id, "active"],
    // La función que se ejecutará para obtener los datos.
    queryFn: findActiveProducts,
    // ¡IMPORTANTE! La consulta solo se ejecutará si hay una empresa seleccionada.
    enabled: !!company?.id,
  });
};

/**
 * Obtiene la lista de productos INACTIVOS para la empresa actual.
 * @returns El resultado de la consulta de useQuery.
 */
export const useInactiveProducts = () => {
    const { findInactiveProducts } = useProductService();
    const { company } = useCompany();

    return useQuery({
        queryKey: ["products", company?.id, "inactive"],
        queryFn: findInactiveProducts,
        enabled: !!company?.id,
    });
};

/**
 * Obtiene los detalles de un único producto por su ID.
 * @param {number} productId - El ID del producto a buscar.
 * @returns El resultado de la consulta de useQuery.
 */
export const useProductById = (productId) => {
    const { findProductById } = useProductService();

    return useQuery({
        queryKey: ["products", productId], // La clave incluye el ID del producto específico.
        queryFn: () => findProductById(productId),
        enabled: !!productId, // Solo se ejecuta si se proporciona un ID.
    });
}


// =================================================================
// == HOOKS DE ESCRITURA (MUTATIONS)
// =================================================================

/**
 * Proporciona una función para CREAR un nuevo producto.
 * Al tener éxito, invalida las consultas de la lista de productos para refrescar la UI.
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { createProduct } = useProductService();

  return useMutation({
    mutationFn: createProduct, // La función del servicio que se ejecutará
    onSuccess: () => {
      // Cuando la mutación es exitosa, le decimos a React Query que los datos
      // de "products" están obsoletos. Esto hará que se vuelvan a pedir.
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      Notifier.error("Error al crear el producto");
    }
  });
};

/**
 * Proporciona una función para ACTUALIZAR un producto existente.
 * Al tener éxito, refresca tanto la lista general como el detalle del producto afectado.
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const { updateProduct } = useProductService();

    return useMutation({
        mutationFn: updateProduct, // Espera un objeto { id, payload }
        onSuccess: (data, variables) => {
            // Invalida la lista completa para actualizar la tabla.
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Invalida la consulta específica de este producto para refrescar la vista de edición.
            queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
        },
    });
}

/**
 * Proporciona una función para DESACTIVAR un producto.
 * Al tener éxito, refresca la lista de productos.
 */
export const useDeactivateProduct = () => {
    const queryClient = useQueryClient();
    const { deactivateProduct } = useProductService();

    return useMutation({
        mutationFn: deactivateProduct, // Espera el ID del producto
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

/**
 * Proporciona una función para REACTIVAR un producto.
 * Al tener éxito, refresca la lista de productos.
 */
export const useReactivateProduct = () => {
    const queryClient = useQueryClient();
    const { reactivateProduct } = useProductService();

    return useMutation({
        mutationFn: reactivateProduct, // Espera el ID del producto
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}
