import React, { useState } from 'react';

const ExcelReport = ({ show, onGenerate, onCancel }) => {
  const [fileName, setFileName] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(fileName);
    setFileName('');
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-sm">
        <div
          className="modal-content text-white text-center p-4 rounded"
          style={{ backgroundColor: '#8578AB' }}
        >
          <h5 className="fw-bold mb-2">Generar Reporte Excel</h5>
          <p className="mb-3">Ingrese el nombre para el archivo</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control mb-4"
              placeholder="Nombre del archivo"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              style={{
                borderRadius: '999px',
                backgroundColor: '#D9D9D9',
                border: 'none',
                padding: '10px 15px',
                textAlign: 'center'
              }}
            />

            <div className="d-flex justify-content-center gap-3">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: '#1B043B',
                  color: '#fff',
                  padding: '6px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Generar Reporte
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFileName('');
                  onCancel();
                }}
                style={{
                  backgroundColor: '#fff',
                  color: '#1B043B',
                  padding: '6px 20px',
                  borderRadius: '8px',
                  border: '1px solid #1B043B',
                  fontWeight: 'bold'
                }}
              >
                Cancelar Generación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExcelReport;
