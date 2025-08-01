// src/components/shared/DocumentViewDefaults.jsx

import React from 'react';
import { FaSearch, FaPlusCircle } from 'react-icons/fa';


// --- INICIO DE LA CORRECCIÓN ---
// Construimos la fecha de hoy usando los componentes locales para evitar errores de zona horaria.
const date = new Date();
const year = date.getFullYear();
// getMonth() es 0-indexado (0=Enero), por eso sumamos 1.
// padStart asegura que tengamos dos dígitos (ej. '07' en lugar de '7').
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const today = `${year}-${month}-${day}`;
// --- FIN DE LA CORRECCIÓN ---

// Este componente replica EXACTAMENTE el formulario de filtros original.
export const DefaultFilterComponent = ({ register, handleSubmit, onSearch, watch, handleClear, handleShowAll, styles }) => (
  <form onSubmit={handleSubmit(onSearch)}>
    <div className={`d-flex align-items-end gap-4 ${styles.filter}`}>
      <div className={styles.filterItem}><label className="form-label fw-bold">Inicio:</label><input type="date" className="form-control" {...register("startDate")}  max={today} /></div>
      <div className={styles.filterItem}><label className="form-label fw-bold">Fin:</label><input type="date" className="form-control" {...register("endDate")}  max={today} /></div>
      <div className="d-flex gap-2 ms-auto">
        <button type="submit" className={styles.actionButton}><FaSearch className="me-2" /> Buscar</button>
        {(watch("startDate") || watch("endDate")) && <button type="button" className={styles.actionButton} onClick={handleClear}>Limpiar Fechas</button>}
        <button type="button" className={styles.actionButton} onClick={handleShowAll}>Mostrar Todos</button>
      </div>
    </div>
  </form>
);

// Este componente replica EXACTAMENTE los botones de acción originales.
export const DefaultActionsComponent = ({listTitle, handleNew, setSortBy, sortBy, filters, styles }) => (
// restaurando el diseño original.
  <>
    {/* 1. El título, centrado en su propia línea, como estaba antes. */}
    <h3 className="text-center mb-3">{listTitle}</h3>

    {/* 2. El contenedor de botones, en una línea separada debajo del título. */}
    <div className="d-flex justify-content-between align-items-center">
      {/* Lado izquierdo: Botones de ordenamiento */}
      <div>
        {/* La lógica para mostrar/ocultar los botones se mantiene */}
        {(!filters.startDate && !filters.endDate) && (
          <div className="d-flex gap-2">
            <button className={`${styles.actionButton} ${sortBy !== 'status' ? styles.inactiveSortButton : ''}`} onClick={() => setSortBy('status')}>
              Ordenar por Estado
            </button>
            <button className={`${styles.actionButton} ${sortBy !== 'date' ? styles.inactiveSortButton : ''}`} onClick={() => setSortBy('date')}>
              Ordenar por Fecha
            </button>
          </div>
        )}
      </div>
      
      {/* Lado derecho: Botón de acción principal */}
      <div>
        <button type="button" className={styles.actionButton} onClick={handleNew}>
          <FaPlusCircle className="me-1" /> Nuevo
        </button>
      </div>
    </div>
  </>

);