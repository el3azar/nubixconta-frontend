import React from "react";
import styles from "../../../../styles/accounting/reportsStyles/card.module.css";

const accFilterCardBase = ({
  titulo,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  nivelDetalle,
  onNivelDetalleChange, // Si esta prop no se pasa, los radios se ocultan
  onSearch,
}) => {
  const mostrarNivelDetalle = typeof onNivelDetalleChange === "function";

  return (
    <section className={styles.buscador}>
      
      {/* --- OBJETIVO 2: Título --- */}
      {titulo && <h3 className={styles.tarjetaTitulo}>{titulo}</h3>}

      {/* --- OBJETIVO 3: Fila 1 (Fechas) --- */}
      <div className={styles.fila}>
        <div className={styles.fechaGrupo}>
          <label htmlFor="startDate">Inicio:</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className={styles.fechaGrupo}>
          <label htmlFor="endDate">Fin:</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <button className={styles.btnBuscar} onClick={onSearch}>
          {/* 2. SVG en línea reemplaza a FaSearch */}
          <svg 
            width="1em" 
            height="1em" 
            viewBox="0 0 16 16" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
            aria-hidden="true"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          Buscar
        </button>
      </div>

      {/* --- OBJETIVO 1 y 3: Fila 2 Opcional (Radios) --- */}
      {/* Esto solo se renderiza si 'mostrarNivelDetalle' es true */}
      {mostrarNivelDetalle && (
        <div className={styles.fila}>
          <div className={styles.detalleGrupo}>
            <label>Nivel de detalle:</label>

            <div className={styles.radioOpcion}>
              <input
                type="radio"
                id="resumido"
                name="nivelDetalle"
                value="Resumido"
                checked={nivelDetalle === "Resumido"}
                onChange={(e) => onNivelDetalleChange(e.target.value)}
              />
              <label htmlFor="resumido">Resumido</label>
            </div>

            <div className={styles.radioOpcion}>
              <input
                type="radio"
                id="detallado"
                name="nivelDetalle"
                value="Detallado"
                checked={nivelDetalle === "Detallado"}
                onChange={(e) => onNivelDetalleChange(e.target.value)}
              />
              <label htmlFor="detallado">Detallado</label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default accFilterCardBase;