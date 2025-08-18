import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
// ¡CAMBIO IMPORTANTE! Importamos el resolver de Zod
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../../schemas/productSchema';
import Swal from 'sweetalert2';
import styles from "../../../styles/inventory/Boton.module.css"; // Asegúrate de que este archivo exista

const ProductFormModal = ({ show, onSave, onClose, initialData = null }) => {
  const isCreateMode = !initialData;

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
     resolver: zodResolver(productSchema),
    context: { isCreateMode }, // Pasamos el modo al contexto de validación
    defaultValues: {
        productCode: '',
        productName: '',
        unit: '',
        stockQuantity: 0,
    }
  });

   // --- useEffect MEJORADO para manejar el estado del formulario ---
  useEffect(() => {
    // Solo hacemos algo si el modal se va a mostrar
    if (show) {
      if (isCreateMode) {
        // MODO CREACIÓN: Reseteamos explícitamente a los valores por defecto (vacíos).
        // Esto asegura que los datos de una edición anterior se limpien por completo.
        reset({
          productCode: '',
          productName: '',
          unit: '',
          stockQuantity: 0,
        });
      } else {
        // MODO EDICIÓN: Poblamos el formulario con los datos iniciales.
        reset({
          productCode: initialData.productCode,
          productName: initialData.productName,
          unit: initialData.unit,
          // La cantidad no se edita, pero es bueno ser explícito
          stockQuantity: initialData.stockQuantity, 
        });
      }
    }
  }, [show, isCreateMode, initialData, reset]); // Las dependencias son correctas


  if (!show) return null;

  const onSubmit = (data) => {
    // El 'onSave' del padre recibirá los datos limpios y validados.
    onSave(data);
  };

  const handleCancel = () => {
    Swal.fire({
      title: `¿Desea cancelar la ${isCreateMode ? 'creación' : 'edición'}?`,
      text: "Los cambios no se guardarán.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1B043B',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        onClose();
      }
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#baadd4ff' }}>
          <div className="modal-body">
          <h2 className="text-center mb-4">{isCreateMode ? 'Nuevo Producto' : 'Editar Producto'}</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ... Aquí va el JSX del formulario, ahora conectado a react-hook-form ... */}
            {/* Ejemplo para un campo: */}
            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Código de producto</label>
                    <input type="text" {...register("productCode")} className={`form-control rounded-pill ${errors.productCode ? 'is-invalid' : ''}`}
                  maxLength={10}/>
                    {errors.productCode && <div className="invalid-feedback">{errors.productCode.message}</div>}
                </div>
                <div className="col-md-7">
                    <label>Nombre de producto</label>
                    <input type="text" {...register("productName")} className={`form-control rounded-pill ${errors.productName ? 'is-invalid' : ''}`}
                  maxLength={50}/>
                    {errors.productName && <div className="invalid-feedback">{errors.productName.message}</div>}
                </div>
            </div>
            {/* ... Repetir para otros campos (unit, stockQuantity) ... */}
            <div className="row mb-3">
                <div className="col-md-5">
                  <label>Unidad de Representacion</label>
                  <input type="text" {...register("unit")} className={`form-control rounded-pill ${errors.unit ? 'is-invalid' : ''}`}
                  maxLength={20} />
                  {errors.unit && <div className="invalid-feedback">{errors.unit.message}</div>}
                </div>
                {/* El campo de cantidad solo se muestra en modo CREACIÓN */}
                {isCreateMode ? (
                  <div className="col-md-4">
                    <label>Cantidad Inicial</label>
                    <input type="number" {...register("stockQuantity")} className={`form-control rounded-pill ${errors.stockQuantity ? 'is-invalid' : ''}`}/>
                    {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity.message}</div>}
                  </div>
                ) : (
                  <div className="col-md-4">
                    <label>Cantidad Actual (Referencia)</label>
                    <input type="number" value={initialData.stockQuantity} disabled className="form-control rounded-pill me-2" title="El stock solo puede ser modificado mediante movimientos de inventario."/>
                  </div>
                )}
            </div>
            
            <div className="d-flex justify-content-center gap-3">
              <button type="submit" className={`${styles.btnCustomMorado} btn rounded-pill me-2`}>
                {isCreateMode ? 'Guardar Nuevo Producto' : 'Guardar Cambios'}
              </button>
              <button type="button" className={`${styles.btnCustomBlanco} btn rounded-pill me-2`} onClick={handleCancel}>
                 {isCreateMode ? 'Cancelar Registro' : 'Cancelar Edición'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;