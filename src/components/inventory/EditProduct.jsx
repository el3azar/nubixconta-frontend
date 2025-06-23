import React, { useState, useEffect } from 'react';
import CancelRegister from './CancelRegister'; // 🔧 IMPORTANTE

const EditProduct = ({ show, product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    unidad: '',
    cantidad: ''
  });

  const [showCancelModal, setShowCancelModal] = useState(false); // 🔧 NUEVO

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo || '',
        nombre: product.nombre || '',
        unidad: product.unidad || '',
        cantidad: product.existencias?.toString() || ''
      });
    }
  }, [product]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...product,
      codigo: formData.codigo,
      nombre: formData.nombre,
      unidad: formData.unidad,
      existencias: parseInt(formData.cantidad)
    });
  };

  const handleCancelClick = () => {
    setShowCancelModal(true); // 🔧 Mostrar confirmación
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    onCancel(); // 🔧 Ejecuta el cierre real
  };

  const cancelCancel = () => {
    setShowCancelModal(false); // 🔧 Solo oculta el modal de confirmación
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog modal-lg">
          <div
            className="modal-content text-white p-4 rounded"
            style={{ backgroundColor: '#6B5E80' }}
          >
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
                  required
                />
              </div>

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
                  Guardar Cambios
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={handleCancelClick} // 🔧 CAMBIADO
                  style={{
                    backgroundColor: '#fff',
                    color: '#1B043B',
                    padding: '6px 20px',
                    borderRadius: '8px',
                    border: '1px solid #1B043B',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <CancelRegister
        show={showCancelModal}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </>
  );
};

export default EditProduct;
