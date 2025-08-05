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
 * @param {Array} props.apiDataCodigo - Datos para el buscador de códigos.
 * @param {object|null} props.codigoValue - El objeto de opción seleccionado para el código.
 * @param {function} props.onCodigoChange - Función para manejar cambios en el select de código.
 * @param {Array} props.apiDataNombre - Datos para el buscador de nombres.
 * @param {object|null} props.nombreValue - El objeto de opción seleccionado para el nombre.
 * @param {function} props.onNombreChange - Función para manejar cambios en el select de nombre.
 * @param {function} props.onBuscar - Función que se ejecuta al hacer clic en "Buscar".
 * @param {function} props.onLimpiar - Función que se ejecuta al hacer clic en "Limpiar".
 * @param {string} [props.tamano='tamano-grande'] - Clase para el tamaño de la tarjeta.
 */
function SearchCardBase({
  // Props para el buscador de Código
  apiDataCodigo,
  codigoValue,
  onCodigoChange,

  // Props para el buscador de Nombre
  apiDataNombre,
  nombreValue,
  onNombreChange,

  // Props para los botones
  onBuscar,
  onLimpiar,
  tamano = 'tamano-grande'
}) {
  return (
    <div className={`card shadow-sm ${tamano} mb-4`}>
      <div className="card-header">
        <h4 className="mb-0">Buscar Producto</h4>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="codigo-search" className="form-label">Código</label>
            <SelectBase
              apiData={apiDataCodigo}
              value={codigoValue}
              onChange={onCodigoChange}
              placeholder="Buscar por código..."
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="nombre-search" className="form-label">Nombre del Producto</label>
            <SelectBase
              apiData={apiDataNombre}
              value={nombreValue}
              onChange={onNombreChange}
              placeholder="Buscar por nombre..."
            />
          </div>
        </div>
      </div>
      <div className="card-footer text-end">
        <Boton color="morado" forma="pastilla" onClick={onBuscar}>
          <i className="bi bi-search me-2"></i>
          Buscar
        </Boton>
        <Boton color="blanco" forma="pastilla" className="ms-2" onClick={onLimpiar}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Limpiar
        </Boton>
      </div>
    </div>
  );
}

export default SearchCardBase;