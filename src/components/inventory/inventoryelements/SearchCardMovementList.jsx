// elementos/SearchCardBase.jsx
import React, { useState } from 'react';
import Boton from './Boton';
// Asumo que tienes un archivo CSS para el tamaño.
import styles from '../../../styles/inventory/SearchCardBase.module.css';
import SelectBase from './SelectBase';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
 * @param {object|undefined} props.dateRange - Rango de fechas seleccionado.
 * @param {function} props.onDateRangeChange - Función para manejar cambios en el rango de fechas.
 * @param {function} props.onBuscar - Función que se ejecuta al hacer clic en "Buscar".
 * @param {function} props.onLimpiar - Función que se ejecuta al hacer clic en "Limpiar".
 * @param {string} [props.tamano='tamano-grande'] - Clase para el tamaño de la tarjeta.
 */
function SearchCardMovementList({
  // Props para el primer buscador: Código de Producto
  apiDataCodigo,
  codigoValue,
  onCodigoChange,

  // Props para el segundo buscador: Tipo de Movimiento
  apiDataTipoMovimiento,
  tipoMovimientoValue,
  onTipoMovimientoChange,

  // Props para el DayPicker
  dateRange,
  onDateRangeChange,

  // Props para los botones
  onBuscar,
  onLimpiar,
  tamano = 'tamano-grande'
}) {
  // Nuevo estado para controlar la visibilidad del DayPicker
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Muestra y oculta el picker
  const togglePicker = () => setIsPickerVisible(!isPickerVisible);

  // Renderiza el texto del rango de fechas seleccionado
  const renderDateRangeText = () => {
    if (dateRange?.from) {
      const fromDate = format(dateRange.from, 'PPP', { locale: es });
      const toDate = dateRange.to ? format(dateRange.to, 'PPP', { locale: es }) : 'hoy';
      return `${fromDate} - ${toDate}`;
    }
    return 'Selecciona un rango de fechas';
  };


  return (
    <div className={`card shadow-sm ${styles[tamano]} mb-4`}>
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

          {/* Campo para el DayPicker */}
          <div className="col-md-12">
            <label className="form-label">Rango de Fechas (Fecha 1 - Fecha 2)</label>
            <div className="position-relative">
              {/* Botón que muestra el rango y activa/desactiva el popover */}
              <button
                type="button"
                className="form-control text-start"
                title="Selecciona una fecha primero y luego otra"
                onClick={togglePicker}
                style={{ cursor: 'pointer' }}
              >
                {renderDateRangeText()}
              </button>

              {/* Contenedor del DayPicker (Popover) */}
              {isPickerVisible && (
                <div className="position-absolute z-1000 mt-1 p-2 bg-white border rounded shadow-lg">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      onDateRangeChange(range);
                      // Opcional: Cerrar el picker si se completa el rango
                      if (range?.to) {
                         togglePicker();
                      }
                    }}
                    locale={es}
                  />
                  <div className="text-end mt-2">
                    <button onClick={togglePicker} className="btn btn-sm btn-outline-secondary">Cerrar</button>
                  </div>
                </div>
              )}
            </div>
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
          Limpiar Campos
        </Boton>
      </div>
    </div>
  );
}

export default SearchCardMovementList;