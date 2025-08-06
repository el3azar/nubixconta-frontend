import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {useActiveProducts,useUpdateProduct,useCreateProduct,useDeactivateProduct,useReactivateProduct,} from '../../../hooks/useProductQueries'; 
// --- TUS COMPONENTES DE DISEÑO (SIN CAMBIOS) ---
import Boton from '../inventoryelements/Boton';
import SearchCardBase from '../inventoryelements/SearchCardBase';
import TableComponent from '../inventoryelements/TableComponent';
import SwitchActionProduct from '../inventoryelements/SwitchActionProduct';
import RegisterProduct from './RegisterProduct';
import EditProduct from './EditProduct';
import { useProductService } from '../../../services/inventory/productService'; // Importamos el servicio para la búsqueda
// CORRECCIÓN 1: Importamos tu formateador de fechas.
import { formatDate } from '../../../utils/dateFormatter'; 

const ProductView = () => {
  const queryClient = useQueryClient(); // Cliente de React Query para invalidaciones
  
  // ===================================================================
  // == 1. SUSTITUCIÓN DE DATOS QUEMADOS POR DATOS REALES DE LA API ==
  // ===================================================================
  // Usamos nuestro hook para obtener los productos activos.
  // React Query maneja el estado de carga, errores y el cache por nosotros.
  const { data: activeProducts = [], isLoading, isError } = useActiveProducts();

  // ===================================================================
  // == 2. MANEJO DEL ESTADO DE BÚSQUEDA ==
  // ===================================================================
  // El servicio para llamar al endpoint de búsqueda.
  const { searchActiveProducts } = useProductService(); 
  
  // Estados para los campos de búsqueda (controlados por SearchCardBase)
  const [codigoFilter, setCodigoFilter] = useState(null);
  const [nombreFilter, setNombreFilter] = useState(null);

  // Nuevo estado para guardar los resultados de la búsqueda del servidor.
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // La tabla ahora mostrará los resultados de la búsqueda si existen, si no, la lista completa.
  const productosParaMostrar = searchResults !== null ? searchResults : activeProducts;

  // ===================================================================
  // == 3. CONEXIÓN DE LAS MUTACIONES (Create, Update, Deactivate) ==
  // ===================================================================
  // Hooks de mutación. Nos dan una función `mutate` para ejecutar la acción.
  const { mutate: createProductMutate } = useCreateProduct();
  const { mutate: updateProductMutate } = useUpdateProduct();
  const { mutate: deactivateProductMutate } = useDeactivateProduct();
  const { mutate: reactivateProductMutate } = useReactivateProduct();

  // ===================================================================
  // == 4. ESTADOS LOCALES PARA LA UI (MODALES) ==
  // ===================================================================
  // Estos no cambian, siguen controlando la visibilidad de los modales.
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  // ===================================================================
  // == 5. ADAPTACIÓN DE LÓGICA EXISTENTE ==
  // ===================================================================

 // CORRECCIÓN 1: Ajustamos la estructura de datos al formato { value, label }
  const datosParaBusquedaPorNombre = useMemo(() => activeProducts.map(p => ({
    value: p.productName, // El valor que usaremos para la búsqueda
    label: p.productName, // El texto que verá el usuario en el selector
  })), [activeProducts]);
  
  const datosParaBusquedaPorCodigo = useMemo(() => activeProducts.map(p => ({
    value: p.productCode,
    label: p.productCode,
  })), [activeProducts]);

  // La función de Toggle ahora llama a la mutación correspondiente.
  const handleToggleProduct = useCallback((productId, nuevoEstado) => {
    if (nuevoEstado) {
      reactivateProductMutate(productId, {
        onSuccess: () => console.log(`Producto ${productId} reactivado.`),
        onError: (err) => console.error("Error al reactivar:", err),
      });
    } else {
      deactivateProductMutate(productId, {
        onSuccess: () => console.log(`Producto ${productId} desactivado.`),
        onError: (err) => console.error("Error al desactivar:", err),
      });
    }
  }, [deactivateProductMutate, reactivateProductMutate]);

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
  ], [handleToggleProduct,activeProducts]); // La dependencia es correcta.

  // --- NUEVA LÓGICA PARA LOS HANDLERS ---
  const handleLimpiar = () => {
    setCodigoFilter(null);
    setNombreFilter(null);
    setSearchResults(null); // Limpiamos los resultados para volver a la lista principal.
    queryClient.invalidateQueries({ queryKey: ["products", "active"] }); // Opcional: refresca la lista principal.
  };

  // CORRECCIÓN 2: Ajustamos la lógica de `handleBuscar` para leer la propiedad '.value'
  const handleBuscar = async () => {
    // Añadimos un log para depuración
    console.log("Iniciando búsqueda con filtros seleccionados:", { codigoFilter, nombreFilter });

    setIsSearching(true);
    try {
      const filters = {};
      if (codigoFilter?.value) {
        filters.code = codigoFilter.value;
      }
      if (nombreFilter?.value) {
        filters.name = nombreFilter.value;
      }

      if (Object.keys(filters).length === 0) {
        console.log("No se ha seleccionado ningún criterio de búsqueda válido.");
        setSearchResults(null);
        setIsSearching(false); // Detenemos el estado de búsqueda
        return; 
      }
      
      console.log("Enviando los siguientes filtros al backend:", filters);
      const results = await searchActiveProducts(filters);
      setSearchResults(results);

    } catch (error) {
      console.error("Error durante la búsqueda:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAbrirModalEditar = (producto) => {
    setProductoAEditar(producto);
  };

  const handleCerrarModal = () => {
    setProductoAEditar(null);
    setShowRegisterModal(false);
  };

  // El guardado ahora usa la mutación de actualización.
  const handleGuardarCambios = (productoActualizado) => {
    updateProductMutate({ 
      id: productoAEditar.idProduct, 
      payload: productoActualizado 
    }, {
      onSuccess: () => handleCerrarModal(),
    });
  };

  // El registro ahora usa la mutación de creación.
  const handleRegistrarProducto = (nuevoProducto) => {
    createProductMutate(nuevoProducto, {
      onSuccess: () => {
        handleCerrarModal();
        // Opcional: podrías mostrar una notificación de éxito aquí.
      },
    });
  };

  // ===================================================================
  // == 6. RENDERIZADO DEL COMPONENTE ==
  // ===================================================================

  if (isLoading) return <p className="text-center">Cargando productos...</p>;
  if (isError) return <p className="text-center text-danger">Error al cargar los productos.</p>;

  return (
    <div>
      <h2>Lista de Productos</h2>
      <div>
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
          isSearching={isSearching} // Pasamos el estado de búsqueda al botón
        />
      </div>
      <div className="row">
            <div className="col-auto">
                <Boton color="morado" forma="pastilla" className="mb-4" onClick={() => setShowRegisterModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Producto
                </Boton>
            </div>
            <div className="col-md-3">
              <Link to="/inventario/desactiveprod">
                <Boton color="morado" forma="pastilla" className="mb-4" >
                  <i className="bi bi-eye me-2"></i>
                  Ver Desactivados
                </Boton>
              </Link>
            </div>
      </div>
      <RegisterProduct
        show={showRegisterModal}
        onClose={handleCerrarModal}
        onSave={handleRegistrarProducto} // Conectamos la función de guardado
      />
      
      {productoAEditar && (
        <EditProduct
          show={!!productoAEditar}
          product={productoAEditar}
          onSave={handleGuardarCambios}
          onCancel={handleCerrarModal}
        />
      )}
      <div>
        <TableComponent
          columns={columns}
          data={productosParaMostrar}
          withPagination={true}
          isLoading={isSearching} // La tabla puede mostrar un indicador de carga durante la búsqueda
        />
      </div>
    </div>
  );
};

export default ProductView;