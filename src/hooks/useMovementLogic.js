import { useState, useMemo } from 'react';
import { useMovements } from './useInventoryMovementQueries';
import { useActiveProducts } from './useProductQueries';

// Este hook encapsula toda la lógica compartida para las vistas de movimientos
export const useMovementLogic = () => {
  // --- Estados de la Vista que afectan la consulta a la API ---
  const [sortBy, setSortBy] = useState('status');
  const [apiFilters, setApiFilters] = useState({});
  
  // --- Estados para los controles del formulario de búsqueda ---
  const [codigoFilter, setCodigoFilter] = useState(null);
  const [tipoMovimientoFilter, setTipoMovimientoFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // Para el filtro rápido

  // --- Hook de Datos de React Query ---
  // Obtiene la lista de movimientos según los filtros de la API y el ordenamiento
  const { data: movimientos = [], isLoading, isError, error } = useMovements(sortBy, apiFilters);
  // Obtiene los productos para poblar los selectores de búsqueda
  const { data: activeProducts = [] } = useActiveProducts();

  // --- Handlers para la Búsqueda (se comunican con la API) ---
  const handleBuscar = () => {
    const filtersToApply = {};
    if (dateRange?.from && dateRange?.to) {
      filtersToApply.startDate = dateRange.from.toISOString().split('T')[0];
      filtersToApply.endDate = dateRange.to.toISOString().split('T')[0];
    }
    setApiFilters(filtersToApply);
  };

  const handleLimpiar = () => {
    setCodigoFilter(null);
    setTipoMovimientoFilter(null);
    setDateRange(null);
    setApiFilters({}); // Limpia los filtros de la API para volver a cargar todos
  };

  // --- Datos Memoizados para Componentes Hijos ---
  const datosParaBusquedaPorCodigo = useMemo(() => activeProducts.map(p => ({ value: p.productCode, label: p.productCode })), [activeProducts]);
  const datosParaBusquedaPorTipo = useMemo(() => [{ value: 'ENTRADA', label: 'Entrada' }, { value: 'SALIDA', label: 'Salida' }], []);
  
  // --- Filtrado final del lado del cliente ---
  // Se aplica sobre los datos ya obtenidos (sea la lista completa o la filtrada por fecha)
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(movimiento => {
      const coincideEstado = !statusFilter || movimiento.status === statusFilter;
      const coincideCodigo = !codigoFilter?.value || movimiento.product?.productCode === codigoFilter.value;
      const coincideTipo = !tipoMovimientoFilter?.value || movimiento.movementType === tipoMovimientoFilter.value;
      return coincideEstado && coincideCodigo && coincideTipo;
    });
  }, [movimientos, statusFilter, codigoFilter, tipoMovimientoFilter]);

  // El hook devuelve un objeto con todo lo que las vistas necesitan
  return {
    // Datos y Estado de Carga
    movimientos: movimientosFiltrados, // Devuelve la lista ya filtrada
    isLoading, isError, error,
    
    // Props para SearchCardMovement
    searchProps: {
      apiDataCodigo: datosParaBusquedaPorCodigo,
      codigoValue: codigoFilter,
      onCodigoChange: setCodigoFilter,
      apiDataTipoMovimiento: datosParaBusquedaPorTipo,
      tipoMovimientoValue: tipoMovimientoFilter,
      onTipoMovimientoChange: setTipoMovimientoFilter,
      dateRange: dateRange,
      onDateChange: setDateRange,
      onBuscar: handleBuscar,
      onLimpiar: handleLimpiar,
    },

    // Props para los botones de la cabecera
    headerProps: {
      sortBy, setSortBy,
      statusFilter, setStatusFilter,
    }
  };
};