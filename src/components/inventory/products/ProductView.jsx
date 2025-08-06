import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// HOOKS DE DATOS (Sin cambios)
import {
  useActiveProducts,
  useUpdateProduct,
  useCreateProduct,
  useDeactivateProduct,
  useReactivateProduct,
} from '../../../hooks/useProductQueries';

// COMPONENTES DE DISEÑO Y SERVICIOS
import Boton from '../inventoryelements/Boton';
import SearchCardBase from '../inventoryelements/SearchCardBase';
import TableComponent from '../inventoryelements/TableComponent';
import SwitchActionProduct from '../inventoryelements/SwitchActionProduct';
import { useProductService } from '../../../services/inventory/productService';
import { formatDate } from '../../../utils/dateFormatter';
import { showErrorAlert } from '../../../utils/alertUtils';
// ¡NUEVO! Importamos el formulario unificado
import ProductFormModal from './ProductFormModal';

const ProductView = () => {
  const queryClient = useQueryClient();
  
  // LÓGICA DE DATOS (Sin cambios, ya era correcta)
  const { data: activeProducts = [], isLoading, isError } = useActiveProducts();
  const { searchActiveProducts } = useProductService(); 
  const { mutate: createProductMutate } = useCreateProduct();
  const { mutate: updateProductMutate } = useUpdateProduct();
  const { mutate: deactivateProductMutate } = useDeactivateProduct();
  const { mutate: reactivateProductMutate } = useReactivateProduct();

  // ESTADOS DE BÚSQUEDA (Sin cambios)
  const [codigoFilter, setCodigoFilter] = useState(null);
  const [nombreFilter, setNombreFilter] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- ¡REFACTORIZACIÓN DE ESTADOS DE MODALES! ---
  // AHORA SOLO NECESITAMOS 2 ESTADOS EN LUGAR DE 3
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null); // Sigue igual

  const productosParaMostrar = searchResults !== null ? searchResults : activeProducts;

  // LÓGICA PARA LOS SELECTS (Sin cambios)
  const datosParaBusquedaPorNombre = useMemo(() => activeProducts.map(p => ({ value: p.productName, label: p.productName })), [activeProducts]);
  const datosParaBusquedaPorCodigo = useMemo(() => activeProducts.map(p => ({ value: p.productCode, label: p.productCode })), [activeProducts]);
  
  // --- ¡REFACTORIZACIÓN DE HANDLERS! ---
  
  // LÓGICA DE TABLA (Sin cambios)
  const handleToggleProduct = useCallback((productId, nuevoEstado) => {
    const action = nuevoEstado ? reactivateProductMutate : deactivateProductMutate;
    action(productId);
  }, [deactivateProductMutate, reactivateProductMutate]);

  const columns = useMemo(() => [
    // ... (Definición de columnas sin cambios)
    { header: 'Código', accessorKey: 'productCode' },
    { header: 'Nombre', accessorKey: 'productName' },
    { header: 'Unidad', accessorKey: 'unit' },
    { header: 'Existencias', accessorKey: 'stockQuantity' },
    { header: 'Fecha Creación', accessorKey: 'creationDate', cell: ({ row }) => formatDate(row.original.creationDate) }, 
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => (
        <div className="d-flex gap-2 justify-content-center">
          <Boton color="morado" forma="pastilla" className='me-2' title='Editar' onClick={() => handleAbrirModalEditar(row.original)}>
            <i className="bi bi-pencil-square"></i>
          </Boton>
          <div className="d-flex align-items-center" title='Activar/Desactivar'>
            <SwitchActionProduct
              initialState={row.original.productStatus}
              onToggle={(nuevoEstado) => handleToggleProduct(row.original.idProduct, nuevoEstado)}
            />
          </div>
        </div>
      ),
    },
  ], [handleToggleProduct, activeProducts]);

  // LÓGICA DE BÚSQUEDA (Sin cambios)
  const handleLimpiar = () => {
    setCodigoFilter(null);
    setNombreFilter(null);
    setSearchResults(null);
    queryClient.invalidateQueries({ queryKey: ["products", "active"] });
  };
  const handleBuscar = async () => {
    setIsSearching(true);
    try {
      const filters = {};
      if (codigoFilter?.value) filters.code = codigoFilter.value;
      if (nombreFilter?.value) filters.name = nombreFilter.value;
      if (Object.keys(filters).length === 0) {
        setSearchResults(null);
        return; 
      }
      const results = await searchActiveProducts(filters);
      setSearchResults(results);
    } catch (error) {
      console.error("Error durante la búsqueda:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- ¡REFACTORIZACIÓN DE HANDLERS DE MODALES! ---
  // Ahora son más limpios y claros
  const handleAbrirModalCrear = () => {
    setProductoAEditar(null); // Asegura modo creación
    setIsFormModalOpen(true);
  };
  const handleAbrirModalEditar = (producto) => {
    setProductoAEditar(producto); // Configura modo edición
    setIsFormModalOpen(true);
  };
  const handleCerrarModal = () => {
    setIsFormModalOpen(false);
    // No es estrictamente necesario limpiar productoAEditar aquí, 
    // pero es buena práctica. Se limpiará al abrir el de crear.
  };
  
  // ¡UN ÚNICO HANDLER DE GUARDADO!
 const handleSave = (data) => {
        const mutationOptions = {
            onSuccess: () => {
                // Esto ya lo teníamos: al tener éxito, cerramos el modal.
                handleCerrarModal();
                // Opcional: Podríamos añadir una alerta de éxito aquí si quisiéramos.
            },
            onError: (error) => {
                // --- ESTA ES LA LÓGICA NUEVA Y CRUCIAL ---
                // Comprobamos si el error viene de Axios y tiene un mensaje del backend.
                if (error.response && error.response.data && error.response.data.message) {
                    // Mostramos el mensaje de error específico que nos envió el backend.
                    showErrorAlert(error.response.data.message);
                } else {
                    // Si es un error genérico (ej. de red), mostramos un mensaje estándar.
                    showErrorAlert('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
                }
            }
        };

        if (productoAEditar) { // Si hay un producto para editar...
            updateProductMutate({ id: productoAEditar.idProduct, payload: data }, mutationOptions);
        } else { // Si no, es un producto nuevo...
            createProductMutate(data, mutationOptions);
        }
    };

  if (isLoading) return <p className="text-center">Cargando productos...</p>;
  if (isError) return <p className="text-center text-danger">Error al cargar los productos.</p>;

  // --- ¡REFACTORIZACIÓN DEL RENDERIZADO! ---
  return (
    <div>
      <h2>Lista de Productos</h2>
      <SearchCardBase
        tamano='tamano-grande'
        apiDataCodigo={datosParaBusquedaPorCodigo}
        codigoValue={codigoFilter}
        onCodigoChange={setCodigoFilter}
        apiDataNombre={datosParaBusquedaPorNombre}
        nombreValue={nombreFilter}
        onNombreChange={setNombreFilter}
        onBuscar={handleBuscar}
        onLimpiar={handleLimpiar}
        isSearching={isSearching}
      />
      <div className="row">
        <div className="col-auto">
          <Boton color="morado" forma="pastilla" className="mb-4" onClick={handleAbrirModalCrear}>
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Producto
          </Boton>
        </div>
        <div className="col-md-3">
          <Link to="/inventario/desactiveprod">
            <Boton color="morado" forma="pastilla" className="mb-4">
              <i className="bi bi-eye me-2"></i>
              Ver Desactivados
            </Boton>
          </Link>
        </div>
      </div>
      
      {/* ¡UN ÚNICO MODAL PARA GOBERNARLOS A TODOS! */}
      <ProductFormModal
        show={isFormModalOpen}
        onClose={handleCerrarModal}
        onSave={handleSave}
        initialData={productoAEditar}
      />
      
      <TableComponent
        columns={columns}
        data={productosParaMostrar}
        withPagination={true}
        isLoading={isSearching}
      />
    </div>
  );
};

export default ProductView;