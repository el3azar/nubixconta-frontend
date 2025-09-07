import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { inventorySubMenuLinks } from '../../../config/menuConfig'; // <-- La configuración de inventario
import SubMenu from "../../shared/SubMenu";

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
// Importamos el Notifier completo en lugar de funciones específicas.
import { Notifier } from '../../../utils/alertUtils';
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
 // --- ¡CAMBIO #2! ---
  // AÑADIMOS ALERTAS AL TOGGLE DE ACTIVAR/DESACTIVAR
  const handleToggleProduct = useCallback((productId, nuevoEstado) => {
    const action = nuevoEstado ? reactivateProductMutate : deactivateProductMutate;
    action(productId, {
      onSuccess: () => {
        const message = nuevoEstado ? 'Producto reactivado con éxito.' : 'Producto desactivado con éxito.';
        Notifier.successInventory(message); // Usamos el toast temático de inventario (verde)
      },
      onError: (error) => {
        Notifier.errorInventory(error.response?.data?.message || 'No se pudo cambiar el estado del producto.'); // Usamos el toast temático (rojo)
      }
    });
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
          <Boton color="morado" forma="pastilla" className='me-2' title='Editar' size="icon" onClick={() => handleAbrirModalEditar(row.original)}>
            <i className="bi bi-pencil-square me-2 mb-2 mt-2 ms-2"></i>
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
  
  // REFACTORIZAMOS EL HANDLER DE GUARDADO CON EL NUEVO NOTIFIER
  const handleSave = (data) => {
    const esEdicion = !!productoAEditar;
    
    const mutationOptions = {
        onSuccess: () => {
            handleCerrarModal();
            // Usamos el toast verde de inventario para el éxito
            const message = esEdicion ? 'Producto actualizado con éxito.' : 'Producto creado con éxito.';
            Notifier.success(message);
        },
        onError: (error) => {
            // Usamos el modal de error bloqueante, ya que el modal de formulario está abierto
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
            Notifier.showError('Error al Guardar', errorMessage);
        }
    };

    if (esEdicion) {
        updateProductMutate({ id: productoAEditar.idProduct, payload: data }, mutationOptions);
    } else {
        createProductMutate(data, mutationOptions);
    }
  };

  if (isLoading) return <p className="text-center">Cargando productos...</p>;
 if (isError) {
    // ¡OPORTUNIDAD DE MEJORA! AÑADIMOS UNA ALERTA EN LA CARGA INICIAL
    Notifier.errorRed('No se pudieron cargar los productos desde el servidor.');
    return <p className="text-center text-danger">Error al cargar los productos.</p>;
  }

  // --- ¡REFACTORIZACIÓN DEL RENDERIZADO! ---
  return (
    <>
      <SubMenu links={inventorySubMenuLinks} />
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
      <div className="d-flex gap-2">
        <Boton color="morado" forma="pastilla" className="mb-4" onClick={handleAbrirModalCrear}>
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Producto
        </Boton>
        <Link to="/inventario/desactiveprod">
          <Boton color="morado" forma="pastilla" className="mb-4">
            <i className="bi bi-eye me-2"></i>
            Ver Desactivados
          </Boton>
        </Link>
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
  </>

  );
};

export default ProductView;