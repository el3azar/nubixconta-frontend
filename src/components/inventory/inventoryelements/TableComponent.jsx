// components/BaseTable.jsx
import {
  useReactTable,          // Reemplaza useTable de v7
  getCoreRowModel,        // Modelo básico para manejar filas
  getFilteredRowModel,    // Modelo para filtrado
  getPaginationRowModel,  // Modelo para paginación
  flexRender             // Nuevo sistema de renderizado
} from '@tanstack/react-table';
import './StyleTable.css';

const BaseTable = ({
  columns,               // Array de definiciones de columnas
  data,                 // Datos a mostrar
  globalFilter,         // Filtro global aplicado
  onGlobalFilterChange, // Handler para cambios en filtro global
  withPagination = true, // Flag para mostrar/ocultar paginación
  pageSize = 10,// <-- Nueva prop con valor por defecto
  rowProps = () => ({}),
}) => {
  /**
   * Configuración principal de la tabla
   * - Notar que ahora todo va en un solo objeto de configuración
   * - Los plugins (useFilters, usePagination) ahora son modelos
   */
  const table = useReactTable({
    data,       // Datos de la tabla
    columns,    // Definición de columnas
    // Modelos requeridos (reemplazan los plugins de v7)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Estado inicial (la paginación ahora va dentro de pagination)
    initialState: { pagination: { pageSize: pageSize } },
    // Estado y handlers para filtro global
    state: {
      globalFilter
    },
    onGlobalFilterChange: onGlobalFilterChange,
  });

  return (
    <div className="table-container">
      {/* Filtro Global - Ahora manejado directamente por la tabla */}
      {/* 
      <input
        type="text"
        value={globalFilter ?? ''}  // Manejo seguro de valores null/undefined
        onChange={e => onGlobalFilterChange(e.target.value)}
        placeholder="Buscar..."
        className="global-filter"
      />
      */}

      {/* Tabla - Notar que ya no usa getTableProps() */}
      <table>
        <thead>
          {/* Mapeo de grupos de encabezados */}
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {/* Mapeo de columnas dentro del grupo */}
              {headerGroup.headers.map(header => (
                <th key={header.id} className='text-center'>
                  {/* flexRender reemplaza el renderizado directo */}
                  {flexRender(
                    header.column.columnDef.header, // Contenido del header
                    header.getContext()            // Contexto de la columna
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        
        <tbody>

          
          {table.getRowModel().rows.map(row => {
          // --- ESTA ES LA CORRECCIÓN CLAVE ---
          
          // 1. Obtenemos las props dinámicas para la fila
          const FilaProps = rowProps(row);
          
          // 2. Combinamos la clase base con la clase dinámica
          const classNames = `text-center ${FilaProps.className || ''}`.trim();

          return (
            // 3. Aplicamos las props y la clase combinada
            <tr key={row.id} {...FilaProps} className={classNames}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          );
        })}
        </tbody>
      </table>

      {/* Paginación - Métodos ahora acceden a través de la tabla */}
      {withPagination && (
        <div className="pagination">
          <button
            onClick={() => table.previousPage()} // Acción ahora en table
            disabled={!table.getCanPreviousPage()} // Verificación cambió
          >
            Anterior
          </button>
          <span>
            {/* Los índices ahora vienen del estado de la tabla */}
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()} {/* Nuevo método para total de páginas */}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseTable;