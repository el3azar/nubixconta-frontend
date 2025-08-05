import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
//import CancelRegister from './CancelRegister';
import Swal from 'sweetalert2'; // 2. Importamos SweetAlert2
import { showSuccess, showError } from '../../alerts';
import { createProduct } from '../../../../services/inventory/productService'; // Asegúrate de que esta ruta es correcta
import '../../alerts.css';
import styles from '../elementos/Boton.module.css'

const RegisterProduct = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    correlativo: '',
    codigo: '',
    nombre: '',
    unidad: '',
    cantidad: ''
  });

//  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { correlativo, codigo, nombre, unidad, cantidad } = formData;

    // Validaciones
    if (!correlativo || !codigo || !nombre || !unidad || !cantidad) {
      showError('NOTA: Hacen falta uno o varios datos del registro');
      return;
    }

    if (!/^\d+$/.test(correlativo)) {
      showError('El campo "Correlativo" debe contener solo números');
      return;
    }

    if (!/^\d+$/.test(cantidad)) {
      showError('El campo "Cantidad" debe contener solo números');
      return;
    }

    try {
      const producto = {
        productCode: codigo,
        productName: nombre,
        unit: unidad,
        stockQuantity: parseInt(cantidad),
        productDate: new Date().toISOString(),
        productStatus: true
      };

      await createProduct(producto);

      showSuccess('El producto fue registrado con éxito');

      // Limpiar formulario
      setFormData({
        correlativo: '',
        codigo: '',
        nombre: '',
        unidad: '',
        cantidad: ''
      });

      onClose(); 

    } catch (error) {
      showError('Ocurrió un error al registrar el producto');
    }
  };

  // 4. Se modifica esta función para usar SweetAlert
  const handleCancelClick = () => {
    Swal.fire({
      title: '¿Desea cancelar el registro?',
      text: "No se guardarán los datos ingresados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1B043B',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      // Si el usuario confirma, se cierra el modal principal
      if (result.isConfirmed) {
        onClose();
      }
    });
  };

  
  if (!show) return null;

  return (
    <>
      <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content text-white p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
            <h3 className="text-center mb-4">Nuevo Producto</h3>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                {/*
                <div className="col-md-6">
                  <label>Correlativo</label>
                  <input
                    type="text"
                    className="form-control"
                    name="correlativo"
                    value={formData.correlativo}
                    onChange={handleChange}
                    pattern="\d+"
                    title="Solo números"
                    required
                  />
                </div>
                */}
                <div className="col-md-3">
                  <label>Código de producto</label>
                  <input
                    type="text"
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: 1, 2, 303 etc.'
                    name="codigo"
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
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: Laptop Dell, Procesador Lentium4, etc.'
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3 ">                
                <div className="col-md-5">
                  <label>Unidad de representación</label>
                  <input
                    type="text"
                    className="form-control rounded-pill me-2"
                    placeholder="Ejemplo: M, Cm, etc."
                    name="unidad"
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
                    className="form-control rounded-pill me-2"
                    placeholder='Ejemplo: 10, 20, 100, etc.'
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min={0}
                    required
                    />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className={`${styles.btnCustomMorado} btn rounded-pill me-2`}>
                  Guardar Nuevo Producto
                </button>
                <button
                  type="button"
                  className={`${styles.btnCustomBlanco} btn rounded-pill me-2`}
                  onClick={handleCancelClick} // Esta función ahora abre SweetAlert
                  
                >
                  Cancelar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterProduct;
