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
  tamano = 'tamano-grande'
}) {
  return (
    <div className={`card shadow-sm ${tamano} mb-4`}>
      <div className="card-header">
        <h4 className="mb-0">Buscar Movimientos</h4>
      </div>
      <div className="card-body">
        <div className="row g-3">
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
