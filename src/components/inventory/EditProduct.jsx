import React, { useState, useEffect } from 'react';
import CancelRegister from './CancelRegister';
import { showSuccess, showError } from './alerts';
import './alerts.css';

const EditProduct = ({ show, product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    unidad: '',
    cantidad: ''
  });

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.productCode || '',
        nombre: product.productName || '',
        unidad: product.unit || '',
        cantidad: product.stockQuantity?.toString() || ''
      });
    }
  }, [product]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    const limits = {
      codigo: 10,
      nombre: 50,
      unidad: 20
    };

    if (limits[name] && value.length > limits[name]) return;

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { codigo, nombre, unidad, cantidad } = formData;

    if (!codigo || !nombre || !unidad || !cantidad) {
      showError('NOTA: Hacen falta uno o varios datos del registro');
      return;
    }

    if (!/^\d+$/.test(cantidad)) {
      showError('NOTA: Se está ingresando información incorrecta en uno o más campos');
      return;
    }

   onSave({
  productCode: codigo,
  productName: nombre,
  unit: unidad,
  stockQuantity: parseInt(cantidad)
});


    showSuccess('El Registro se actualizó con éxito');
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  const cancelCancel = () => {
    setShowCancelModal(false);
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content text-white p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
            <h3 className="text-center mb-4">Editar Producto</h3>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>Código de producto</label>
                  <input
                    type="text"
                    name="codigo"
                    className="form-control"
                    value={formData.codigo}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-8">
                  <label>Nombre de producto</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={formData.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label>Unidad de representación</label>
                  <input
                    type="text"
                    name="unidad"
                    className="form-control"
                    value={formData.unidad}
                    onChange={handleChange}
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  className="form-control"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className="btn" style={{ backgroundColor: '#1B043B', color: '#fff', padding: '6px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                  Guardar Cambios
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={handleCancelClick}
                  style={{ backgroundColor: '#fff', color: '#1B043B', padding: '6px 20px', borderRadius: '8px', border: '1px solid #1B043B', fontWeight: 'bold' }}
                >
                  Cancelar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CancelRegister
        show={showCancelModal}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </>
  );
};

export default EditProduct;
