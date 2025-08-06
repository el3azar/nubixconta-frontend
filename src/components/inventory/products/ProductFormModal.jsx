import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
// ¡CAMBIO IMPORTANTE! Importamos el resolver de Zod
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../../schemas/productSchema';
import Swal from 'sweetalert2';
import styles from '../inventoryelements/Boton.module.css';

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

  // Usamos useEffect para resetear el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (show && initialData) {
      reset({
        productCode: initialData.productCode,
        productName: initialData.productName,
        unit: initialData.unit,
      });
    } else {
      reset(); // Limpia el formulario para el modo de creación
    }
  }, [initialData, show, reset]);

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
      <div className="modal-dialog modal-lg">
        <div className="modal-content text-white p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
          <h3 className="text-center mb-4">{isCreateMode ? 'Nuevo Producto' : 'Editar Producto'}</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ... Aquí va el JSX del formulario, ahora conectado a react-hook-form ... */}
            {/* Ejemplo para un campo: */}
            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Código de producto</label>
                    <input type="text" {...register("productCode")} className={`form-control rounded-pill ${errors.productCode ? 'is-invalid' : ''}`} placeholder='Ejemplo: 1, 2, 303 etc.'
                  maxLength={10}/>
                    {errors.productCode && <div className="invalid-feedback">{errors.productCode.message}</div>}
                </div>
                <div className="col-md-7">
                    <label>Nombre de producto</label>
                    <input type="text" {...register("productName")} className={`form-control rounded-pill ${errors.productName ? 'is-invalid' : ''}`}  placeholder='Ejemplo: Laptop Dell, Procesador Lentium4, etc.'
                  maxLength={50}/>
                    {errors.productName && <div className="invalid-feedback">{errors.productName.message}</div>}
                </div>
            </div>
            {/* ... Repetir para otros campos (unit, stockQuantity) ... */}
            <div className="row mb-3">
                <div className="col-md-5">
                  <label>Unidad de Representacion</label>
                  <input type="text" {...register("unit")} className={`form-control rounded-pill ${errors.unit ? 'is-invalid' : ''}`} placeholder="Ejemplo: M, Cm, etc."
                  maxLength={20} />
                  {errors.unit && <div className="invalid-feedback">{errors.unit.message}</div>}
                </div>
                {/* El campo de cantidad solo se muestra en modo CREACIÓN */}
                {isCreateMode ? (
                  <div className="col-md-4">
                    <label>Cantidad Inicial</label>
                    <input type="number" {...register("stockQuantity")} className={`form-control rounded-pill ${errors.stockQuantity ? 'is-invalid' : ''}`} placeholder='Ejemplo: 10, 20, 100, etc.' min="0" />
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
  );
};

export default ProductFormModal;