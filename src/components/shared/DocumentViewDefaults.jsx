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

export const DefaultFilterComponent = ({ register, handleSubmit, onSearch, watch, handleClear, handleShowAll, styles }) => (
  <form onSubmit={handleSubmit(onSearch)}>
    <div className={styles.filterContainer}>
      <div className={styles.filterDateGroup}>
        <div className={styles.filterItem}><label className="form-label fw-bold">Inicio:</label><input type="date" className="form-control" {...register("startDate")}  max={today} /></div>
        <div className={styles.filterItem}><label className="form-label fw-bold">Fin:</label><input type="date" className="form-control" {...register("endDate")}  max={today} /></div>
      </div>
      <div className={styles.filterButtonGroup}>
        <button type="submit" className={styles.actionButton}><FaSearch className="me-2" /> Buscar</button>
        {(watch("startDate") || watch("endDate")) && <button type="button" className={styles.actionButton} onClick={handleClear}>Limpiar</button>}
        <button type="button" className={styles.actionButton} onClick={handleShowAll}>Todos</button>
      </div>
    </div>
  </form>
);

export const DefaultActionsComponent = ({listTitle, handleNew, setSortBy, sortBy, filters, styles }) => (
  <>
    {/* 1. Título "Ventas", ahora envuelto para controlarlo */}
    <div className={styles.titleContainer}>
      <h3 className={`text-center mb-3 ${styles.sectionTitle}`}>{listTitle}</h3>
    </div>

    {/* 2. Contenedor principal de acciones */}
    <div className={styles.actionsContainer}>
      <div className={styles.sortButtonGroup}>
        {(!filters.startDate && !filters.endDate) && (
          <>
            <button className={`${styles.actionButton} ${sortBy !== 'status' ? styles.inactiveSortButton : ''}`} onClick={() => setSortBy('status')}>
              Ordenar por Estado
            </button>
            <button className={`${styles.actionButton} ${sortBy !== 'date' ? styles.inactiveSortButton : ''}`} onClick={() => setSortBy('date')}>
              Ordenar por Fecha
            </button>
          </>
        )}
      </div>
      <div className={styles.newButtonContainer}>
        <button type="button" className={styles.actionButton} onClick={handleNew}>
          <FaPlusCircle className="me-1" /> Nuevo
        </button>
      </div>
    </div>
  </>
);

//Este componente se ocupa en Cuentas por cobrar por que no senecesita el boton de nuevo

export const SortActionsComponent = ({ listTitle, setSortBy, sortBy, filters, styles }) => (
  <>
    {/* 1. Título */}
    <div className={styles.titleContainer}>
      <h3 className={`text-center mb-3 ${styles.sectionTitle}`}>{listTitle}</h3>
    </div>

    {/* 2. Contenedor de acciones, ahora solo con los botones de ordenamiento */}
    <div className={styles.actionsContainer}>
      <div className={styles.sortButtonGroup}>
        {/* La lógica para mostrar/ocultar los botones se mantiene */}
        {(!filters.startDate && !filters.endDate) && (
          <>
            <button 
              className={`${styles.actionButton} ${sortBy !== 'status' ? styles.inactiveSortButton : ''}`} 
              onClick={() => setSortBy('status')}
            >
              Ordenar por Estado
            </button>
            <button 
              className={`${styles.actionButton} ${sortBy !== 'date' ? styles.inactiveSortButton : ''}`} 
              onClick={() => setSortBy('date')}
            >
              Ordenar por Fecha
            </button>
          </>
        )}
      </div>
      {/* El div para el botón "Nuevo" ha sido eliminado completamente */}
    </div>
  </>
);