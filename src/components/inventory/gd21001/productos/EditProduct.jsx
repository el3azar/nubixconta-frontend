import React, { useState, useEffect } from 'react';
// 1. Ya no se necesita el import de CancelRegister
// import CancelRegister from './CancelRegister';
import Swal from 'sweetalert2'; // Se importa SweetAlert2
import { showSuccess, showError } from '../../alerts';
import '../../alerts.css';
import styles from '../elementos/Boton.module.css'

const EditProduct = ({ show, product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    unidad: '',
    cantidad: ''
  });

  // 2. Se elimina el estado para el modal de cancelación
  // const [showCancelModal, setShowCancelModal] = useState(false);

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

  // 3. Se modifica la función para usar SweetAlert
  const handleCancelClick = () => {
    Swal.fire({
      title: '¿Desea cancelar la edición?',
      text: "Los cambios no se guardarán.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1B043B',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        onCancel(); // Llama a la función onCancel del padre si se confirma
      }
    });
  };

  // 4. Se eliminan las funciones auxiliares para el modal viejo
  /*
  const confirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  const cancelCancel = () => {
    setShowCancelModal(false);
  };
  */

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content text-white p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
            <h3 className="text-center mb-4">Editar Producto</h3>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label>Código de producto</label>
                  <input
                    type="text"
                    name="codigo"
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: 1, 2, 303 etc.'
                    value={formData.codigo}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="col-md-7">
                  <label>Nombre de producto</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: Laptop Dell, Procesador Lentium4, etc.'
                    value={formData.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">                
                <div className="col-md-5">
                  <label>Unidad de representación</label>
                  <input
                    type="text"
                    name="unidad"
                    className="form-control rounded-pill me-2"
                    placeholder="Ejemplo: M, Cm, etc."
                    value={formData.unidad}
                    onChange={handleChange}
                    maxLength={20}
                    required
                  />
                </div>
                <div className="col-md-4">
                    <label>Cantidad</label>
                    <input
                    type="number"
                    name="cantidad"
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: 10, 20, 100, etc.'
                    value={formData.cantidad}
                    onChange={handleChange}
                    min={0}
                    required
                    />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className={`${styles.btnCustomMorado} btn rounded-pill me-2`}>
                  Guardar Cambios
                </button>

                <button
                  type="button"
                  className={`${styles.btnCustomBlanco} btn rounded-pill me-2`}
                  onClick={handleCancelClick} // La función ahora abre SweetAlert
                >
                  Cancelar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/*
      <CancelRegister
        show={showCancelModal}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
      */}
    </>
  );
};

export default EditProduct;
