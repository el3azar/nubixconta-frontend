import React, { useState, useMemo, useCallback } from 'react';
import Boton from '../inventoryelements/Boton';
import { Link } from 'react-router-dom';
import TableComponent from '../inventoryelements/TableComponent';
import { showSuccess } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';
import { formatDate } from '../../../utils/dateFormatter';
import { useQueryClient } from '@tanstack/react-query';

// --- NUESTROS HOOKS DE DATOS ---
import {
  useInactiveProducts,
  useReactivateProduct,
} from '../../../hooks/useProductQueries'; // Ajusta la ruta si es necesario


const DesableProductView = () => {
  const queryClient = useQueryClient(); // Cliente de React Query para invalidaciones

  // ===================================================================
  // == 1. OBTENCIÓN DE DATOS REALES DE LA API ==
  // ===================================================================
  // Usamos nuestro hook para obtener los productos INACTIVOS.
  const { data: inactiveProducts = [], isLoading, isError } = useInactiveProducts();

  // ===================================================================
  // == 2. CONEXIÓN DE LA MUTACIÓN DE REACTIVACIÓN ==
  // ===================================================================
  // Hook de mutación para reactivar un producto.
  const { mutate: reactivateProductMutate } = useReactivateProduct();

  // ===================================================================
  // == 3. ADAPTACIÓN DE LA LÓGICA EXISTENTE ==
  // ===================================================================
  // La función ahora usa la mutación para reactivar.
  const handleReactivate = async (productId) => {
    // Llama a tu servicio de confirmación
    const result = await showConfirmationDialog('¿Activar producto?', "El estado del producto cambiará a ACTIVO.", 'Sí, activar', 'Cancelar');

    if (result.isConfirmed) {
      // Si el usuario confirma, llamamos a la mutación.
      reactivateProductMutate(productId, {
        onSuccess: () => {
          // El 'onSuccess' de la mutación ya invalida la query, por lo que la lista se
          // actualizará automáticamente. Mostramos un feedback al usuario.
          showSuccess('¡Producto activado con éxito!');
        },
        onError: (error) => {
          // Opcional: Manejo de errores específico aquí si lo necesitas.
          console.error("Error al reactivar el producto:", error);
          // Podrías mostrar una alerta de error aquí.
        }
      });
    }
  };
  
  // Las columnas ahora usan los nombres de propiedad del DTO real.
  const columns = useMemo(() => [
    { header: 'Código', accessorKey: 'productCode' },
    { header: 'Nombre', accessorKey: 'productName' },
    { header: 'Unidad', accessorKey: 'unit' },
    { header: 'Existencias', accessorKey: 'stockQuantity' },
    { header: 'Fecha Creación', accessorKey: 'creationDate', cell: ({ row }) => formatDate(row.original.creationDate) },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => (
        <div className="d-flex justify-content-center">
          <Boton color="morado" forma="pastilla"  onClick={() => handleReactivate(row.original.idProduct)}>
            Activar
          </Boton>
        </div>
      )
    }
  ], []); // Las dependencias pueden estar vacías ya que la función de reactivación es estable.

  // ===================================================================
  // == 4. RENDERIZADO DEL COMPONENTE ==
  // ===================================================================

  if (isLoading) return <p className="text-center">Cargando productos desactivados...</p>;
  if (isError) return <p className="text-center text-danger">Error al cargar los productos.</p>;

  return (
      <div>
          <h2>Lista de Productos Desactivados</h2>
          <div>
              <Link to="/inventario/productos">
                  <Boton color="morado" forma="pastilla" className="mb-4">
                      <i className="bi bi-arrow-left-circle-fill me-2"></i>
                      Regresar
                  </Boton>
              </Link>
          </div>
          <TableComponent
              columns={columns}
              data={inactiveProducts}
              withPagination={true}
              // Ya no necesitamos el filtro global aquí, a menos que quieras implementarlo
              // con una búsqueda en el servidor para los inactivos también.
          />
      </div>
  );
};

export default DesableProductView;