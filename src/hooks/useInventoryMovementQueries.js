import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInventoryMovementService } from "../services/inventory/inventoryMovementService";
import { useCompany } from "../context/CompanyContext";

// Clave base para las consultas de movimientos
const MOVEMENT_QUERY_KEY = "inventoryMovements";

/**
 * Hook de consulta inteligente para obtener movimientos.
 * - Si no hay filtros de fecha, obtiene todos los movimientos ordenados por 'sortBy'.
 * - Si hay filtros de fecha, llama al endpoint de búsqueda por rango de fechas.
 * @param {string} sortBy - Criterio de ordenamiento ('status' o 'date').
 * @param {object} filters - Objeto con los filtros (ej. { startDate, endDate }).
 */

export const useMovements = (sortBy,filters={}) => {
  const { findAllMovements, findMovementsByDateRange } = useInventoryMovementService();
  const { company } = useCompany();

  const hasDateFilters = filters.startDate && filters.endDate;

  return useQuery({
    // La queryKey ahora incluye los filtros para que se vuelva a ejecutar cuando cambien
    queryKey: [MOVEMENT_QUERY_KEY, company?.id, { sortBy, ...filters }],
    
    queryFn: () => {
      if (hasDateFilters) {
        // Si hay fechas, usamos el endpoint de búsqueda por rango
        return findMovementsByDateRange(filters);
      } else {
        // Si no, obtenemos todos, ordenados por el criterio elegido
        return findAllMovements(sortBy);
      }
    },
    
    enabled: !!company?.id,
  });
};

// --- HOOKS DE MUTACIÓN PARA LAS ACCIONES ---

export const useCreateManualMovement = () => {
  const queryClient = useQueryClient();
  const { createManualMovement } = useInventoryMovementService();
  return useMutation({
    mutationFn: createManualMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
    },
  });
};

export const useUpdateManualMovement = () => {
  const queryClient = useQueryClient();
  const { updateManualMovement } = useInventoryMovementService();
  return useMutation({
    mutationFn: updateManualMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
    },
  });
};

export const useApplyMovement = () => {
  const queryClient = useQueryClient();
  const { applyMovement } = useInventoryMovementService();
  return useMutation({
    mutationFn: applyMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
    },
  });
};

export const useCancelMovement = () => {
    const queryClient = useQueryClient();
    const { cancelMovement } = useInventoryMovementService();
    return useMutation({
        mutationFn: cancelMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
        },
    });
};

export const useDeleteManualMovement = () => {
    const queryClient = useQueryClient();
    const { deleteManualMovement } = useInventoryMovementService();
    return useMutation({
        mutationFn: deleteManualMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
        },
    });
};