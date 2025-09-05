const CompanySearchBar = ({ filters, onChange, onSearch, assistantOptions }) => {
  return (
    <div
      className="px-3 py-4 mb-3 rounded"
      style={{ backgroundColor: '#A6A0BD' }}
      
    >
     <div className="d-flex flex-column flex-lg-row justify-content-around">
        <h1 className="text-center" style={{ color: '#2C1A47' }}>Buscar por</h1>
        <div className="col-lg-4 mb-3"> 
          <label className="form-label text-dark">Nombre de la empresa</label>
          <input
            type="text"
            maxLength={100}
            value={filters.nombre || ''}
            onChange={(e) => onChange({ ...filters, nombre: e.target.value })}
            className="form-control"
          />
        </div>


         {/* CAMBIO: Usar un select para Asistente Asignado */}
        <div className="col-lg-4">
          <label className="form-label text-dark">Asistente asignado</label>
          <select
            value={filters.asistente || ''} 
            onChange={(e) => onChange({ ...filters, asistente: e.target.value })}
            className="form-select" 
          >
            {/* Renderiza las opciones pasadas por props */}
            {assistantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

  
    </div>
  );
};

export default CompanySearchBar;
