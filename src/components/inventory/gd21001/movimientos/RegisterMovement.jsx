import React, { useState, useEffect } from 'react';
import SelectBase from '../elementos/SelectBase';
import Boton from '../elementos/Boton';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../../alerts';
// import { createMovement, getProductsForSelect } from '../../../../services/inventory/movementService'; 

// AÑADIMOS LAS PROPS: show, onClose, onSave
const RegisterMovement = ({ show, onClose, onSave }) => {
  // Toda la lógica interna de datos y estado se mantiene igual
  const [opcionesDeProducto, setOpcionesDeProducto] = useState([]);
  const opcionesDeTipo = [
    { id: 'Entrada', nombre: 'Entrada' },
    { id: 'Salida', nombre: 'Salida' },
    { id: 'Ajuste', nombre: 'Ajuste de Inventario' },
  ];

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  
  useEffect(() => {
    // ... la lógica de carga de datos no cambia
    const productosDesdeApi = [
        { id: 'SKU-001', nombre: 'SKU-001' },
        { id: 'SKU-002', nombre: 'SKU-002' },
        { id: 'SKU-004', nombre: 'SKU-004' },
    ];
    setOpcionesDeProducto(productosDesdeApi);
    setFecha(new Date().toISOString().split('T')[0]);
  }, []);

  // Limpiamos el form cada vez que se muestra
  useEffect(() => {
    if(show) {
      setProductoSeleccionado(null);
      setTipoSeleccionado(null);
      setFecha(new Date().toISOString().split('T')[0]);
      setObservacion('');
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !tipoSeleccionado || !fecha) {
      showError('Los campos Producto, Tipo y Fecha son obligatorios.');
      return;
    }

    const nuevoMovimiento = {
      productId: productoSeleccionado.value,
      movementType: tipoSeleccionado.value,
      movementDate: fecha,
      observation: observacion,
      status: 'Pendiente'
    };
    
    // LLAMAMOS A onSave Y LUEGO CERRAMOS
    // En lugar de llamar a la API aquí, le pasamos los datos al padre.
    onSave(nuevoMovimiento); 
    showSuccess('¡Movimiento registrado con éxito!');
    onClose(); // El padre se encargará de cerrar el modal
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

  // Si show es falso, no renderizamos nada.
  if (!show) {
    return null;
  }
  
  // ENVOLVEMOS TODO EN LA ESTRUCTURA DEL MODAL
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
          <div className="modal-body">
            {/* El contenido del formulario es el mismo */}
            <h2 className="text-center mb-4">Registrar Movimiento</h2>
            <form onSubmit={handleSubmit}>
              {/* Filas y columnas del formulario no cambian... */}
              <div className="row mb-4 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Código de producto</label>
                  <SelectBase apiData={opcionesDeProducto} value={productoSeleccionado} onChange={setProductoSeleccionado} placeholder="Buscar producto..."/>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo de movimiento</label>
                  <SelectBase apiData={opcionesDeTipo} value={tipoSeleccionado} onChange={setTipoSeleccionado} placeholder="Seleccionar tipo..."/>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)}/>
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-12">
                  <label className="form-label">Observación</label>
                  <textarea className="form-control" rows="4" placeholder="Ej: Compra a proveedor..." value={observacion} onChange={e => setObservacion(e.target.value)}></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Boton className="rounded-pill me-2" type="submit" color="morado">Guardar Movimiento</Boton>
                <Boton className="rounded-pill me-2" type="button" color="blanco" onClick={handleCancelClick}>Cancelar</Boton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterMovement;