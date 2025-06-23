import React from 'react';
import CustomSelect from './CustomSelect';
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
          <CustomSelect
            options={assistantOptions}
            value={filters.asistente}
            onChange={(value) => onChange({ ...filters, asistente: value })}
            placeholder="Seleccionar asistente"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label text-dark">Estado</label>
          <CustomSelect
            options={['Asignada', 'Sin asignar']}
            value={filters.estado}
            onChange={(value) => onChange({ ...filters, estado: value })}
            placeholder="Seleccionar estado"
          />
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
