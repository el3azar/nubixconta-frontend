import React, { useState, useMemo, useCallback } from 'react';
import Boton from '../inventoryelements/Boton';
import SearchCardMovement from '../inventoryelements/SearchCardMovement';
import TableComponent from '../inventoryelements/TableComponent';
import SwitchAction from '../inventoryelements/SwitchActionMovement';
import { Link } from 'react-router-dom';
// 1. IMPORTAMOS LAS FUNCIONES DE ALERTA NECESARIAS
import { showSuccess, showError } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';
import './MovementView.css';
import RegisterMovement from './RegisterMovement';
import EditMovement from './EditMovement';
import ViewDetailsMovement from './ViewDetailsMovement';

// --- DATOS DE EJEMPLO para la tabla de movimientos ---
const datosDeMovimientos = [
  { id: 1, codigoProducto: 'SKU-001', fecha: '2025-07-31', tipo: 'Entrada', observacion: 'Compra a proveedor principal', modulo: 'Inventario' },
  { id: 2, codigoProducto: 'SKU-002', fecha: '2025-07-31', tipo: 'Salida', observacion: 'Venta a cliente final', modulo: 'Ventas' },
  { id: 3, codigoProducto: 'SKU-001', fecha: '2025-07-30', tipo: 'Ajuste', observacion: 'Corrección de stock por conteo', modulo: 'Inventario' },
  { id: 4, codigoProducto: 'SKU-004', fecha: '2025-07-29', tipo: 'Entrada', observacion: 'Devolución de cliente', modulo: 'Ventas' },
];
// Para el buscador de productos, es mejor tener una lista maestra de productos.
const datosDeProductos = [
  { codigo: 'SKU-001', nombre: 'Laptop Gamer Pro' },
  { codigo: 'SKU-002', nombre: 'Mouse Inalámbrico' },
  { codigo: 'SKU-003', nombre: 'Teclado Mecánico' },
  { codigo: 'SKU-004', nombre: 'Monitor 27"' },
];

const MovementView = () => {
   // --- CAMBIO 1: Guardamos los datos en el estado del componente ---
  const [movimientos, setMovimientos] = useState(datosDeMovimientos);
  // NUEVOS ESTADOS PARA LOS FILTROS
  const [codigoFilter, setCodigoFilter] = useState(null);
  const [tipoMovimientoFilter, setTipoMovimientoFilter] = useState(null);
  // Estado para los filtros (puedes expandirlo como en ProductView)
  //const [globalFilter, setGlobalFilter] = useState('');
  // AÑADIMOS ESTADO PARA CONTROLAR EL MODAL
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  // 2. AÑADIMOS ESTADOS PARA CONTROLAR EL MODAL DE EDICIÓN
  const [showEditModal, setShowEditModal] = useState(false);
  // Este estado guardará el objeto completo del movimiento que se está editando
  const [movementToEdit, setMovementToEdit] = useState(null);
  // AÑADIMOS ESTADOS PARA EL MODAL DE DETALLES
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [movementToView, setMovementToView] = useState(null);
  // PREPARACIÓN DE DATOS PARA LOS SELECTS
  // Para el buscador de Códigos (usando la lista maestra de productos)
  const datosParaBusquedaPorCodigo = useMemo(() => datosDeProductos.map(p => ({
    id: p.codigo,
    nombre: p.codigo, // Buscamos por el código mismo
  })), []); // Dependencia vacía si datosDeProductos es constante

  // Para el buscador de Tipos de Movimiento (extraemos valores únicos de los movimientos)
  const datosParaBusquedaPorTipo = useMemo(() => {
    // Obtenemos todos los tipos: ['Entrada', 'Salida', 'Ajuste', 'Entrada']
    const todosLosTipos = datosDeMovimientos.map(m => m.tipo);
    // Filtramos para obtener valores únicos: ['Entrada', 'Salida', 'Ajuste']
    const tiposUnicos = [...new Set(todosLosTipos)];
    // Mapeamos al formato que SelectBase necesita
    return tiposUnicos.map(tipo => ({ id: tipo, nombre: tipo }));
  }, [movimientos]);

  // 1. Define los textos específicos para MOVIMIENTOS y su toggle
  const configAplicarMovimiento = {
    title: '¿Aplicar movimiento?',
    text: 'El movimiento se registrará y afectará el inventario.',
    confirmButtonText: 'Sí, aplicar',
    cancelButtonText: 'Cancelar',
    successMessage: '¡Movimiento aplicado!'
  };

  const configMarcarPendiente = {
    title: '¿Marcar como pendiente?',
    text: 'El movimiento quedará en espera y no afectará el inventario.',
    confirmButtonText: 'Sí, marcar',
    cancelButtonText: 'Cancelar',
    successMessage: '¡Movimiento pendiente!'
  };

  // 2. CREAMOS LA NUEVA FUNCIÓN PARA ANULAR
  const handleAnularMovimiento = useCallback(async (movementId) => {
      const result = await showConfirmationDialog(
          '¿Anular Movimiento?',
          'Esta acción es irreversible y el movimiento se marcará como anulado.',
          'Sí, anular',
          'Cancelar'
      );

      if (result.isConfirmed) {
          try {
              // Lógica para anular: lo quitamos de la lista principal
              setMovimientos(current => current.filter(mov => mov.id !== movementId));
              showSuccess('¡Movimiento anulado correctamente!');
              // Aquí podrías llamar a una API para actualizar el estado en el backend
              // await api.post(`/movimientos/${movementId}/anular`);
          } catch (error) {
              showError('Error al anular el movimiento.');
          }
      }
  }, []); // useCallback para optimizar
  // 2. Define la función que manejará el cambio de estado
  // --- CAMBIO 2: La función ahora actualiza el estado, provocando un re-render ---
  const handleToggleMovement = (movementId, newState) => {
    const newStatus = newState ? 'Aplicado' : 'Pendiente';

    setMovimientos(movimientosActuales => 
      movimientosActuales.map(mov => {
        if (mov.id === movementId) {
          // Crea un nuevo objeto con el status actualizado
          return { ...mov, status: newStatus };
        }
        // Devuelve el objeto sin cambios
        return mov;
      })
    );
    console.log(`Cambiando estado del movimiento ID ${movementId} a: ${newStatus}`);
    // Aquí iría tu lógica para actualizar el estado en el backend
    // Por ejemplo: updateMovementStatus(movementId, status);
  };
  // 3. NUEVOS HANDLERS PARA EL FLUJO DE EDICIÓN
  const handleOpenEditModal = (movement) => {
    setMovementToEdit(movement); // Guardamos el movimiento a editar
    setShowEditModal(true);      // Abrimos el modal
  };

  const handleUpdateFromModal = (updatedMovement) => {
    // Buscamos el movimiento en nuestra lista y lo reemplazamos por el actualizado
    setMovimientos(currentMovements =>
      currentMovements.map(mov =>
        mov.id === updatedMovement.id ? updatedMovement : mov
      )
    );
    // El modal ya muestra el mensaje de éxito y se cierra solo.
  };
  // NUEVAS FUNCIONES PARA EL FLUJO DE DETALLES
    const handleOpenDetailsModal = (movement) => {
        setMovementToView(movement); // Guardamos el movimiento a visualizar
        setShowDetailsModal(true);   // Abrimos el modal
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setMovementToView(null); // Limpiamos el estado al cerrar
    };
  // Definición de las columnas para la tabla de movimientos
  const columns = useMemo(() => [
    {
      header: 'Cód. Producto',
      accessorKey: 'codigoProducto',
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha',
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo',
    },
    {
      header: 'Observación',
      accessorKey: 'observacion',
    },
    {
      header: 'Módulo',
      accessorKey: 'modulo',
    },
    
    {
      header: 'Acciones',
      id: 'acciones',
      // La celda de acciones ahora tiene 4 botones
      cell: ({ row }) => {
        const isAplicado = row.original.status === 'Aplicado';
        return(
          <div className="d-flex gap-2 justify-content-center">
            {/* Botón Editar */}
            <Boton color="morado" forma="pastilla" title="Editar Movimiento" onClick={() => handleOpenEditModal(row.original)}>
              <i className="bi bi-pencil-square"></i>
            </Boton>
            {/* Botón Ver Detalles */}
            {/* 4. ACTUALIZAMOS EL ONCLICK DEL BOTÓN "VER DETALLES" */}
            <Boton color="morado" forma="pastilla" title="Ver Detalles" onClick={() => handleOpenDetailsModal(row.original)}>
                <i className="bi bi-eye"></i>
            </Boton>
            {/* Botón Activar/Desactivar */}
            
              
            
            {/* 3. Usa el componente SwitchAction con las nuevas props */}
            <div class="d-flex align-items-center" title={row.original.status === 'Aplicado' ? 'Marcar como Pendiente' : 'Aplicar Movimiento'}>
              <SwitchAction
                initialState={row.original.status === 'Aplicado'}
                onToggle={(nuevoEstado) => handleToggleMovement(row.original.id, nuevoEstado)}
                configOn={configAplicarMovimiento}   // Textos para activar (Aplicar)
                configOff={configMarcarPendiente} // Textos para desactivar (Pendiente)
              />
            </div>
            {/* Botón Marcar */}
            <Boton
              color="blanco"
              forma="pastilla"
              title="Anular"
              // 3. ACTUALIZAMOS EL ONCLICK DEL BOTÓN
              onClick={() => handleAnularMovimiento(row.original.id)}
              disabled={!isAplicado}
              >
                <i className="bi bi-dash-circle"></i>
            </Boton>
          </div>
        );
      },
    },
  ], [handleAnularMovimiento]);

  // 4. LÓGICA DE FILTRADO AVANZADA
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(movimiento => {
      const filtroCodigo = (codigoFilter?.value || '').toLowerCase();
      const filtroTipo = (tipoMovimientoFilter?.value || '').toLowerCase();

      const coincideCodigo = movimiento.codigoProducto.toLowerCase().includes(filtroCodigo);
      const coincideTipo = movimiento.tipo.toLowerCase().includes(filtroTipo);
      
      return coincideCodigo && coincideTipo;
    });
  }, [movimientos, codigoFilter, tipoMovimientoFilter]);
  // Lógica de filtrado simple (puedes hacerla más compleja si es necesario)
  
  // 5. HANDLERS PARA BUSCAR Y LIMPIAR
  const handleBuscar = () => {
    alert(`Buscando con: Código="${codigoFilter?.value || ''}", Tipo="${tipoMovimientoFilter?.value || ''}"`);
  };

  const handleLimpiar = () => {
    setCodigoFilter(null);
    setTipoMovimientoFilter(null);
  };

  // 3. CREAMOS LA FUNCIÓN QUE RECIBIRÁ LOS DATOS DEL MODAL
  const handleSaveFromModal = (nuevoMovimientoData) => {
    console.log("Datos recibidos del modal:", nuevoMovimientoData);
    
    const movimientoParaTabla = {
      ...nuevoMovimientoData,
      id: Date.now(), // Generamos un ID único para el ejemplo
      codigoProducto: nuevoMovimientoData.productId, // Ajustamos el nombre de la propiedad
      tipo: nuevoMovimientoData.movementType,
      fecha: nuevoMovimientoData.movementDate,
      observacion: nuevoMovimientoData.observation,
      modulo: 'Inventario' // Asignamos un módulo por defecto
    };

    // Añadimos el nuevo movimiento al principio de la lista para que se vea en la tabla
    setMovimientos(movimientosActuales => [movimientoParaTabla, ...movimientosActuales]);
    // El modal ya se cierra solo y muestra el mensaje de éxito.
  };

  return (
    <div>
      <h2>Gestión de Movimientos de Inventario</h2>
      <div>
          <Link to="/inventario/movimientosproductos">
              <Boton color="morado" forma="pastilla" className="mb-4" >
                  <i className="bi bi-arrow-left-circle-fill me-2"></i>
                  Regresar
              </Boton>
          </Link>
      </div>

      {/* Usamos un SearchCardBase genérico para la búsqueda */}
      {/* 6. IMPLEMENTACIÓN DE SearchCardBase */}
      <SearchCardMovement
        tamano='tamano-grande'
        // Props para el buscador de Código
        apiDataCodigo={datosParaBusquedaPorCodigo}
        codigoValue={codigoFilter}
        onCodigoChange={setCodigoFilter}
        
        // Props para el buscador de Tipo de Movimiento
        apiDataTipoMovimiento={datosParaBusquedaPorTipo}
        tipoMovimientoValue={tipoMovimientoFilter}
        onTipoMovimientoChange={setTipoMovimientoFilter}
        
        // Props para los botones
        onBuscar={handleBuscar}
        onLimpiar={handleLimpiar}
      />
      
      <div className='contenedor-movimientos'>
        <div className="card-header">
          <h4 className="mb-0">Movimientos de Inventario</h4>
        </div>
        <div className="row justify-content-end mt-4">
          <div className="col-auto">
            <Boton color="morado" forma="pastilla" className="mb-4" onClick={() => setShowRegisterModal(true)} >
              <i class="bi bi-plus-circle me-2"></i>
              Agregar Movimiento
            </Boton>
          </div>
          <div className="col-md-auto">
            <Link to="/inventario/moves/pending">
            <Boton color="morado" forma="pastilla" className="mb-4" >
                <i className="bi bi-eye me-2"></i>
                Ver Pendientes
            </Boton>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/inventario/moves/anull">
              <Boton color="morado" forma="pastilla" className="mb-4" >
                <i className="bi bi-dash-circle me-2"></i>
                Ver Anulados
              </Boton>
            </Link>
          </div>
          <div className="col-md-auto">
            <Link to="/inventario/moves/applied">
              <Boton color="morado" forma="pastilla" className="mb-4" >
                <i class="bi bi-check-circle me-2"></i>
                Aplicar Movimientos
              </Boton>
            </Link>
          </div>
        </div>
        <TableComponent
          columns={columns}
          data={movimientosFiltrados}
          withPagination={true}
        />
        {/* 5. RENDERIZAMOS EL MODAL Y LE PASAMOS LAS PROPS */}
        <RegisterMovement
          show={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSave={handleSaveFromModal}
        />
        {/* 5. RENDERIZAMOS EL MODAL DE EDICIÓN Y LE PASAMOS LAS PROPS */}
        {/* Es importante renderizarlo solo si hay un movimiento para editar para evitar errores */}
        {movementToEdit && (
          <EditMovement
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateFromModal}
            movementToEdit={movementToEdit}
          />
        )}
        {/* 5. RENDERIZAMOS EL NUEVO MODAL DE DETALLES */}
        {movementToView && (
            <ViewDetailsMovement
                show={showDetailsModal}
                onClose={handleCloseDetailsModal}
                movement={movementToView}
            />
        )}
      </div>
    </div>
  );
};

export default MovementView;