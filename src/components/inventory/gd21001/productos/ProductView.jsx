import React, { useState, useMemo, useCallback } from 'react';
import Boton from '../elementos/Boton';
import SearchCardBase from '../elementos/SearchCardBase';
import TableComponent from '../elementos/TableComponent';
import SwitchAction from '../elementos/SwitchActionProduct';
import RegisterProduct from './RegisterProduct';
import EditProduct from './EditProduct';
import { Link } from 'react-router-dom';

// --- DATOS DE EJEMPLO para la tabla ---
// En una aplicación real, estos datos vendrían de una llamada a tu backend.
const datosDeProductos = [
  { codigo: 'SKU-001', nombre: 'Laptop Gamer Pro', unidad: 'PZA', existencias: 15, fecha: 'DD/MM/YYYY' },
  { codigo: 'SKU-002', nombre: 'Mouse Inalámbrico', unidad: 'PZA', existencias: 50, fecha: '2025/07/29' },
  { codigo: 'SKU-003', nombre: 'Teclado Mecánico', unidad: 'PZA', existencias: 32, fecha: '2025/07/28' },
  { codigo: 'SKU-004', nombre: 'Monitor 27"', unidad: 'PZA', existencias: 20, fecha: '2025/07/27' },
];

const ProductView = () => {
   // 2. ESTADOS PARA LOS FILTROS
  // Creamos un estado para cada campo de búsqueda en la tarjeta.
  // Esta es la "memoria" de lo que el usuario ha escrito.
  const [codigoFilter, setCodigoFilter] = useState(null);
  const [nombreFilter, setNombreFilter] = useState(null);
  const [productos, setProductos] = useState(datosDeProductos);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  // Cerca de tus otros estados este para registerproduct
  const [productoAEditar, setProductoAEditar] = useState(null);
  // 2. PREPARACIÓN DE DATOS PARA LOS SELECTS
  // Usamos `useMemo` para optimizar y no recalcular en cada render.
  // `SelectBase` espera objetos con `id` y `nombre`.
  const datosParaBusquedaPorNombre = useMemo(() => datosDeProductos.map(p => ({
    id: p.codigo,
    nombre: p.nombre,
  })), [datosDeProductos]);
  // Para buscar por código, creamos un set de datos donde el 'nombre' es también el 'código'.
  const datosParaBusquedaPorCodigo = useMemo(() => datosDeProductos.map(p => ({
    id: p.codigo,
    nombre: p.codigo,
  })), [datosDeProductos]);
  // 2. ENVUELVE LA FUNCIÓN EN useCallback
  // Esto crea una versión memoizada de la función que solo se volverá a crear si sus dependencias cambian.
  // Como `setProductos` es estable, el array de dependencias puede estar vacío.
  const handleToggleProduct = useCallback((codigoProducto, nuevoEstado) => {
    setProductos(productosActuales =>
      productosActuales.map(p =>
        p.codigo === codigoProducto ? { ...p, activo: nuevoEstado } : p
      )
    );
    console.log(`El producto ${codigoProducto} ahora está ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
  }, []); // El array de dependencias está vacío porque setProductos no cambia.

  // Definición de las columnas para la tabla.
  // `useMemo` optimiza el rendimiento al evitar que este arreglo se cree de nuevo en cada renderizado.
  const columns = useMemo(() => [
    { header: 'Código', accessorKey: 'codigo' },
    { header: 'Nombre', accessorKey: 'nombre' },
    { header: 'Unidad', accessorKey: 'unidad' },
    { header: 'Existencias', accessorKey: 'existencias' },
    { header: 'Fecha', accessorKey: 'fecha' },
    {
      header: 'Acciones',
      id: 'acciones', // ID único para la columna que no tiene un `accessorKey` directo.
      // La función `cell` nos permite renderizar JSX personalizado en lugar de solo texto.
      cell: ({ row }) => (
        // `row.original` contiene el objeto de datos completo de esa fila (producto).
        // Lo usamos para pasar el ID o nombre a las funciones de los botones.
        <div className="d-flex gap-2 justify-content-center">
          <Boton color="morado" forma="pastilla" className='me-2' title='Editar' onClick={() => handleAbrirModalEditar(row.original)}>
            <i className="bi bi-pencil-square"></i>
          </Boton>
        
          <div className="d-flex align-items-center" title='Activar/Desactivar'>
            <SwitchAction
              initialState={row.original.activo}
              onToggle={(nuevoEstado) => handleToggleProduct(row.original.codigo, nuevoEstado)}
            />
          </div>
        </div>
      ),
    },
  ], [handleToggleProduct]); // <-- 3. AÑADE handleToggleProduct A LAS DEPENDENCIAS
  // 3. LÓGICA DE FILTRADO ACTUALIZADA
  // Ahora comprueba los objetos de estado de los selects.
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      // Usamos optional chaining (?.) y un fallback para evitar errores si el filtro es `null`.
      const filtroCodigoActual = (codigoFilter?.value || '').toLowerCase();
      const filtroNombreActual = (nombreFilter?.label || '').toLowerCase();

      const coincideCodigo = producto.codigo.toLowerCase().includes(filtroCodigoActual);
      const coincideNombre = producto.nombre.toLowerCase().includes(filtroNombreActual);
      
      return coincideCodigo && coincideNombre;
    });
  }, [productos, codigoFilter, nombreFilter]);

  // 4. HANDLERS (MANEJADORES) PARA LOS BOTONES
  // Estas funciones se pasarán como props a la SearchCardBase.
  const handleLimpiar = () => {
    setCodigoFilter(null);
    setNombreFilter(null);
  };
  const handleBuscar = () => {
    // En este modelo, la tabla ya se filtra mientras escribes.
    // Pero este botón podría ser útil para disparar una nueva búsqueda a la API en el futuro.
    alert(`Filtros aplicados: Código="${codigoFilter?.value || ''}", Nombre="${nombreFilter?.label || ''}"`);
  };
  // Pon estas funciones junto a tus otros handlers----para register product

  // Se llama al hacer clic en el botón "Editar" de una fila
  const handleAbrirModalEditar = (producto) => {
    setProductoAEditar(producto);
  };

  // Se llama al cancelar o al terminar de guardar
  const handleCerrarModal = () => {
    setProductoAEditar(null);
    setShowRegisterModal(false); // Una sola función para cerrar ambos modales
  };

  // Se llama desde el modal EditProduct al guardar
  const handleGuardarCambios = (productoActualizado) => {
    setProductos(productosActuales =>
      productosActuales.map(p =>
        p.codigo === productoActualizado.productCode 
          ? { ...p, nombre: productoActualizado.productName, unidad: productoActualizado.unit, existencias: productoActualizado.stockQuantity } 
          : p
      )
    );
    handleCerrarModal();
  };

  
  return (
    <div>
      <h2>Lista de Productos</h2>
      <div>
        {/* 5. USANDO TU SEARCHCARDBASE CONTROLADO */}
        {/* Le pasamos los estados y las funciones como props para que pueda ser controlado desde aquí. */}
        {/* 5. CONEXIÓN FINAL CON SEARCHCARDBASE */}
        <SearchCardBase
          tamano='tamano-grande'
          
          // Props para el buscador de Código
          apiDataCodigo={datosParaBusquedaPorCodigo}
          codigoValue={codigoFilter}
          onCodigoChange={setCodigoFilter} // ¡Así de simple y directo!
          
          // Props para el buscador de Nombre
          apiDataNombre={datosParaBusquedaPorNombre}
          nombreValue={nombreFilter}
          onNombreChange={setNombreFilter} // ¡Así de simple y directo!

          // Props para los botones
          onBuscar={handleBuscar}
          onLimpiar={handleLimpiar}
        />
      </div>
      {/*Botones de acciones */}
      <div className="row">
            <div className="col-auto">
                <Boton color="morado" forma="pastilla" className="mb-4" onClick={() => setShowRegisterModal(true)}>
                    <i class="bi bi-plus-circle me-2"></i>
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
      />
      
      {/* --- PASO 4: Renderizar el modal de edición --- */}
      {productoAEditar && (
        <EditProduct
          show={!!productoAEditar}
          product={productoAEditar}
          onSave={handleGuardarCambios}
          onCancel={handleCerrarModal}
        />
      )}
      <div>
        {/* 6. LA TABLA RECIBE LOS DATOS YA FILTRADOS */}
        {/* Ya no necesita el `globalFilter`, porque el filtrado se hace en este componente. */}
        <TableComponent
          columns={columns}
          data={productosFiltrados}
          withPagination={true}
        />
      </div>
     
    </div>
  );
};

export default ProductView;