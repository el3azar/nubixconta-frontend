import React from 'react';

import { FiSearch } from 'react-icons/fi';

const CompanySearchBar = ({ filters, onChange, onSearch, assistantOptions }) => {
  return (
    <div
      className="px-3 py-4 mb-3 rounded"
      style={{ backgroundColor: '#A6A0BD' }}
    >
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label text-dark">Nombre de la empresa</label>
          <input
            type="text"
            maxLength={100}
            value={filters.nombre || ''}
            onChange={(e) => onChange({ ...filters, nombre: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label text-dark">Asistente asignado</label>
         
        </div>

        <div className="col-md-4">
          <label className="form-label text-dark">Estado</label>
          
        </div>
      </div>

      {/* Botón en fila propia */}
      <div className="row mt-3">
        <div className="col text-start">
          <button onClick={onSearch} className="btn btn-dark btn-sm rounded-pill px-3">
            <FiSearch className="me-2" />
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanySearchBar;
