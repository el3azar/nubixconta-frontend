import React from 'react';

const CancelRegister = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-sm">
        <div
          className="modal-content text-white text-center p-4 rounded"
          style={{ backgroundColor: '#8578AB' }} // lavanda del fondo
        >
          <p className="fw-bold mb-4">¿Desea cancelar el registro?</p>

          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn"
              onClick={onConfirm}
              style={{
                backgroundColor: '#1B043B',
                color: '#fff',
                padding: '6px 20px',
                borderRadius: '6px',
                border: 'none'
              }}
            >
              SI
            </button>
            <button
              className="btn"
              onClick={onCancel}
              style={{
                backgroundColor: '#fff',
                color: '#1B043B',
                padding: '6px 20px',
                borderRadius: '6px',
                border: '1px solid #1B043B'
              }}
            >
              NO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelRegister;
