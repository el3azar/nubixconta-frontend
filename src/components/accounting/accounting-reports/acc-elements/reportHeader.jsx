import React from 'react';
import styles from '../../../../styles/accounting/reportsStyles/header.module.css';

/**
 * Componente reutilizable para el encabezado de los reportes financieros.
 * @param {object} props
 * @param {string} props.empresa - El nombre de la empresa.
 * @param {string} props.reporte - El nombre del reporte (ej. "Libro Diario").
 * @param {string} props.periodo - El rango de fechas del reporte.
 */
const reportHeader = ({ empresa, reporte, periodo }) => {
  return (
    <section className={styles.encabezado}>
      <h2>{empresa || 'Nombre de la Empresa'}</h2>
      <h3>{reporte || 'Nombre del Reporte'}</h3>
      <h4>{periodo || 'Período del Reporte'}</h4>
    </section>
  );
};

export default reportHeader;