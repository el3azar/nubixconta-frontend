import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CancelRegister from './CancelRegister';

const RegisterProduct = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    correlativo: '',
    codigo: '',
    nombre: '',
    unidad: '',
    cantidad: ''
  });

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      existencias: parseInt(formData.cantidad),
      activo: true,
    });

    // No cerrar el modal aún, esperar acción del usuario
    setFormData({
      correlativo: '',
      codigo: '',
      nombre: '',
      unidad: '',
      cantidad: ''
    });
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onClose(); // Cierra el modal principal
  };

  const handleCancelConfirmModal = () => {
    setShowCancelModal(false); // Cierra solo el modal de confirmación
  };

  return (
    <>
      <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div
            className="modal-content text-white p-4 rounded"
            style={{ backgroundColor: '#6B5E80' }}
          >
            <h3 className="text-center mb-4">Nuevo Producto</h3>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Correlativo</label>
                  <input type="text" className="form-control" name="correlativo" value={formData.correlativo} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>Código de producto</label>
                  <input type="text" className="form-control" name="codigo" value={formData.codigo} onChange={handleChange} required />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-8">
                  <label>Nombre de producto</label>
                  <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label>Unidad de representación</label>
                  <input type="text" className="form-control" name="unidad" value={formData.unidad} onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-4">
                <label>Cantidad</label>
                <input type="number" className="form-control" name="cantidad" value={formData.cantidad} onChange={handleChange} required />
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: '#1B043B', color: '#FFFFFF' }}
                >
                  Guardar Nuevo Producto
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={handleCancelClick}
                  style={{ backgroundColor: '#FFFFFF', color: '#1B043B', border: '1px solid #1B043B' }}
                >
                  Cancelar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <CancelRegister
        show={showCancelModal}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelConfirmModal}
      />
    </>
  );
};

export default RegisterProduct;
