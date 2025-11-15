// src/components/shared/AccountingReportFilter.jsx
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
// Usaremos los estilos de DocumentView que ya tienes y que son perfectos para esto.
import styles from '../../styles/shared/DocumentView.module.css';

const AccountingReportFilter = ({ onFilter, isLoading }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onFilter({ startDate, endDate });
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    // Opcional: si quieres que al limpiar se borren los resultados
    // onFilter({ startDate: null, endDate: null }); 
  };

    return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className={styles.filter}>
        <div className="row g-3">
          {/* --- INICIO DE LA CORRECCIÓN DE ANCHO --- */}
          {/* Damos 9 columnas a las fechas en pantallas grandes */}
          <div className="col-12 col-lg-9">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold">Fecha de Inicio:</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold">Fecha de Fin:</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
          </div>
          {/* Damos 3 columnas a los botones, reduciendo el espacio */}
          <div className="col-12 col-lg-3 d-flex align-items-end justify-content-center">
            <div className="d-flex flex-row flex-lg-column gap-2 align-items-stretch">
              <button type="submit" className={styles.actionButton} disabled={isLoading}>
                <FaSearch className="me-2" /> {isLoading ? 'Generando...' : 'Generar'}
              </button>
              {(startDate || endDate) && (
                <button type="button" className={`${styles.actionButton} ${styles.inactiveSortButton}`} onClick={handleClear}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
          {/* --- FIN DE LA CORRECCIÓN --- */}
        </div>
      </div>
    </form>
  );
};

export default AccountingReportFilter;