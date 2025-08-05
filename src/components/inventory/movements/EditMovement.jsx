// componentes/EditMovement.jsx
import React, { useState, useEffect } from 'react';
import SelectBase from '../inventoryelements/SelectBase';
import Boton from '../inventoryelements/Boton';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../alertstoast';
// import { updateMovement, getProductsForSelect } from '../../../../services/inventory/movementService';

// 1. AÑADIMOS LA PROP CLAVE: `movementToEdit`
// Esta prop contendrá el objeto del movimiento que el usuario quiere editar.
const EditMovement = ({ show, onClose, onSave, movementToEdit }) => {
  
  // --- LÓGICA DE DATOS Y ESTADO ---

  // La lógica para obtener las opciones de los selects es la misma que en el modal de registro.
  const [opcionesDeProducto, setOpcionesDeProducto] = useState([]);
  const opcionesDeTipo = [
    { id: 'Entrada', nombre: 'Entrada' },
    { id: 'Salida', nombre: 'Salida' },
    { id: 'Ajuste', nombre: 'Ajuste de Inventario' },
  ];

  // Estado del formulario
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  
  // Simulación de carga de datos para el select de productos.
  useEffect(() => {
    const productosDesdeApi = [
        { id: 'SKU-001', nombre: 'SKU-001' },
        { id: 'SKU-002', nombre: 'SKU-002' },
        { id: 'SKU-003', nombre: 'SKU-003' },
        { id: 'SKU-004', nombre: 'SKU-004' },
    ];
    setOpcionesDeProducto(productosDesdeApi);
  }, []);

  // 2. EL EFECTO "MÁGICO" PARA POBLAR EL FORMULARIO
  // Este `useEffect` se ejecuta cada vez que `movementToEdit` cambia (o cuando se muestra el modal).
  useEffect(() => {
    if (movementToEdit) {
      // 1. Mapeamos directamente los datos del objeto movementToEdit al formato que SelectBase espera.
      // No necesitamos esperar a que opcionesDeProducto se cargue.
      setProductoSeleccionado({
        value: movementToEdit.codigoProducto,
        label: movementToEdit.codigoProducto, // Usamos el mismo código como etiqueta
      });

      setTipoSeleccionado({
        value: movementToEdit.tipo,
        label: movementToEdit.tipo, // Usamos el mismo tipo como etiqueta
      });

      setFecha(movementToEdit.fecha);
      setObservacion(movementToEdit.observacion);
    } else {
      // Opcional: Limpiamos el estado si el modal se cierra o el prop se vacía.
      setProductoSeleccionado(null);
      setTipoSeleccionado(null);
      setFecha('');
      setObservacion('');
    }
  }, [movementToEdit]); // Solo depende de movementToEdit. // Se re-ejecuta si el movimiento a editar o las opciones de producto cambian.


  // --- LÓGICA DE HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !tipoSeleccionado || !fecha) {
      showError('Los campos Producto, Tipo y Fecha son obligatorios.');
      return;
    }

    // Creamos el objeto actualizado, asegurándonos de incluir el ID original.
    const movimientoActualizado = {
      ...movementToEdit, // Mantenemos los datos originales como id, modulo, etc.
      productId: productoSeleccionado.value,
      codigoProducto: productoSeleccionado.value, // Actualizamos también esta por consistencia
      movementType: tipoSeleccionado.value,
      tipo: tipoSeleccionado.value,
      movementDate: fecha,
      observation: observacion,
    };
    
    // Llamamos a la función onSave que nos pasó el padre
    onSave(movimientoActualizado);
    showSuccess('¡Movimiento actualizado con éxito!');
    onClose();
  };
  
  const handleCancelClick = () => {
      Swal.fire({
            title: '¿Desea cancelar el registro?',
            text: "No se guardarán los datos ingresados.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1B043B',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, continuar'
          }).then((result) => {
            // Si el usuario confirma, se cierra el modal principal
            if (result.isConfirmed) {
              onClose();
            }
          }
      );
    };

  if (!show) {
    return null;
  }
  
  // El JSX es prácticamente idéntico al del modal de registro.
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
          <div className="modal-body">
            <h2 className="text-center mb-4">Editar Movimiento</h2>
            <form onSubmit={handleSubmit}>
              <div className="row mb-4 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Código de producto</label>
                  <SelectBase
                    apiData={opcionesDeProducto}
                    value={productoSeleccionado}
                    onChange={setProductoSeleccionado}
                    placeholder="Buscar producto..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo de movimiento</label>
                  <SelectBase
                    apiData={opcionesDeTipo}
                    value={tipoSeleccionado}
                    onChange={setTipoSeleccionado}
                    placeholder="Seleccionar tipo..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-control rounded-pill me-2" value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-12">
                  <label className="form-label">Observación</label>
                  <textarea className="form-control" rows="4" value={observacion} onChange={e => setObservacion(e.target.value)}></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Boton className="rounded-pill me-2" type="submit" color="morado">Actualizar Movimiento</Boton>
                <Boton className="rounded-pill me-2" type="button" color="blanco" onClick={handleCancelClick}>Cancelar</Boton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMovement;