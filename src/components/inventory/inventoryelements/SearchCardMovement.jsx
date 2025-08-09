// elementos/SearchCardBase.jsx
import React from 'react';
import Boton from './Boton';
// Asumo que tienes un archivo CSS para el tamaño, si no, puedes eliminar esta línea.
import './SearchCardBase.module.css';
import SelectBase from './SelectBase';

/**
 * Tarjeta de búsqueda controlada. No tiene estado propio.
 * Recibe todos los valores y funciones a través de props.
 * @param {object} props
 * @param {Array} props.apiDataCodigo - Datos para el buscador de códigos de producto.
 * @param {object|null} props.codigoValue - Opción seleccionada para el código.
 * @param {function} props.onDateChange - Función para manejar cambios en los inputs de fecha.
 * @param {function} props.onCodigoChange - Función para manejar cambios en el select de código.
 * @param {Array} props.apiDataTipoMovimiento - Datos para el buscador de tipo de movimiento.
 * @param {object|null} props.tipoMovimientoValue - Opción seleccionada para el tipo de movimiento.
 * @param {function} props.onTipoMovimientoChange - Función para manejar cambios en el select de tipo de movimiento.
 * @param {function} props.onBuscar - Función que se ejecuta al hacer clic en "Buscar".
 * @param {function} props.onLimpiar - Función que se ejecuta al hacer clic en "Limpiar".
 * @param {string} [props.tamano='tamano-grande'] - Clase para el tamaño de la tarjeta.
 */
function SearchCardMovement({
  // Props para el primer buscador: Código de Producto
  apiDataCodigo,
  codigoValue,
  onCodigoChange,

  // Props para el segundo buscador: Tipo de Movimiento
  apiDataTipoMovimiento,
  tipoMovimientoValue,
  onTipoMovimientoChange,

  // Props para los botones
  onBuscar,
  onLimpiar,
  tamano = 'tamano-grande',
   // --- ¡NUEVAS PROPS PARA EL FILTRO DE FECHAS! ---
  dateRange,
  onDateChange,
}) {

   // Función helper para manejar el cambio en los inputs de fecha
  const handleDateInputChange = (e) => {
    const { name, value } = e.target;
    // Creamos un nuevo objeto de rango basado en el estado anterior
    const newRange = { 
      from: dateRange?.from || null, 
      to: dateRange?.to || null,
      [name]: value ? new Date(value + 'T00:00:00') : null // Asegura la fecha correcta
    };
    onDateChange(newRange);
  };
  
  // Función para obtener el valor del input en formato YYYY-MM-DD
  const getInputValue = (date) => {
    if (!date) return '';
    // Aseguramos que sea un objeto Date antes de formatear
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className={`card shadow-sm ${tamano} mb-4`}>
      <div className="card-header">
        <h4 className="mb-0">Buscar Movimientos</h4>
      </div>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {/* Columna para el buscador de Código de Producto */}
          <div className="col-md-6">
            <label htmlFor="codigo-search" className="form-label">Código del Producto</label>
            <SelectBase
              apiData={apiDataCodigo}
              value={codigoValue}
              onChange={onCodigoChange}
              placeholder="Buscar por código..."
            />
          </div>

          {/* Columna para el buscador de Tipo de Movimiento */}
          <div className="col-md-6">
            <label htmlFor="tipo-movimiento-search" className="form-label">Tipo de Movimiento</label>
            <SelectBase
              apiData={apiDataTipoMovimiento}
              value={tipoMovimientoValue}
              onChange={onTipoMovimientoChange}
              placeholder="Ej: Entrada, Salida..."
            />
          </div>
          {/* --- ¡NUEVAS COLUMNAS PARA LAS FECHAS! --- */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Fecha Inicio:</label>
            <input 
              type="date" 
              name="from"
              className="form-control" 
              value={getInputValue(dateRange?.from)}
              onChange={handleDateInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Fecha Fin:</label>
            <input 
              type="date" 
              name="to"
              className="form-control" 
              value={getInputValue(dateRange?.to)}
              onChange={handleDateInputChange}
            />
          </div>
        </div>
      </div>
      <div className="card-footer text-end">
        <Boton color="morado" forma="pastilla" onClick={onBuscar}>
          <i className="bi bi-search me-2"></i>
          Buscar Movimiento
        </Boton>
        <Boton color="blanco" forma="pastilla" className="ms-2" onClick={onLimpiar}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Limpiar Campos
        </Boton>
      </div>
    </div>
  );
}

export default SearchCardMovement;
