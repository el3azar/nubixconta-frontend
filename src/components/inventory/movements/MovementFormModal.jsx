import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manualMovementSchema } from '../../../schemas/inventoryMovementSchema';
import { useActiveProducts } from '../../../hooks/useProductQueries';
import SelectBase from '../inventoryelements/SelectBase';
import Boton from '../inventoryelements/Boton';
import { Notifier } from '../../../utils/alertUtils';

const MovementFormModal = ({ show, onClose, onSave, initialData = null }) => {
  const isCreateMode = !initialData;

  const { data: activeProducts = [], isLoading: isLoadingProducts } = useActiveProducts();
  
  const opcionesDeProducto = useMemo(() => activeProducts.map(p => ({
    value: p.idProduct,
    label: `${p.productCode} - ${p.productName}`
  })), [activeProducts]);
  
  const opcionesDeTipo = useMemo(() => [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' },
  ], []);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(manualMovementSchema),
    defaultValues: {
      productId: null,
      movementType: null,
      quantity: '',
      description: ''
    }
  });

  useEffect(() => {
    if (show) {
      if (isCreateMode) {
        reset({ productId: null, movementType: null, quantity: '', description: '' });
      } else {
        // Verificado contra DTOs: `initialData` es un `MovementResponseDTO`
        // `initialData.product` es un `MovementProductInfoDTO` que contiene `productId`
        const productoInicial = opcionesDeProducto.find(p => p.value === initialData.product.productId);
        const tipoInicial = opcionesDeTipo.find(t => t.value === initialData.movementType);
        
        reset({
          productId: productoInicial,
          movementType: tipoInicial,
          quantity: initialData.quantity,
          description: initialData.description
        });
      }
    }
  }, [show, initialData, isCreateMode, reset, opcionesDeProducto, opcionesDeTipo]);

  const onSubmit = (data) => {
    // La data ya está transformada por Zod para coincidir con `ManualMovementCreateDTO`
    if (isCreateMode) {
      onSave(data);
    } else {
      // El payload para actualizar también coincide con `ManualMovementUpdateDTO`
      onSave({ id: initialData.movementId, payload: data });
    }
  };

  const handleCancelClick = async () => {
    const result = await Notifier.confirm({
        title: `¿Desea cancelar la ${isCreateMode ? 'creación' : 'edición'}?`,
        text: "Los cambios no se guardarán.",
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, continuar'
    });
    if (result.isConfirmed) {
        onClose();
    }
  };

  if (!show) {
    return null;
  }
  
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#baadd4ff' }}>
          <div className="modal-body">
            <h2 className="text-center mb-4">{isCreateMode ? 'Registrar Movimiento' : 'Editar Movimiento'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row mb-4 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Código de producto</label>
                  <Controller name="productId" control={control}
                    render={({ field }) => (
                      // --- CORRECCIÓN FINAL Y VERIFICADA: La prop correcta es 'options' ---
                      <SelectBase options={opcionesDeProducto} value={field.value} onChange={field.onChange} placeholder="Buscar producto..." isLoading={isLoadingProducts}/>
                    )}
                  />
                  {errors.productId && <div className="text-danger mt-1">{errors.productId.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tipo de movimiento</label>
                  <Controller name="movementType" control={control}
                    render={({ field }) => (
                      <SelectBase options={opcionesDeTipo} value={field.value} onChange={field.onChange} placeholder="Seleccionar tipo..." />
                    )}
                  />
                  {errors.movementType && <div className="text-danger mt-1">{errors.movementType.message}</div>}
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label">Cantidad</label>
                    <input type="number" {...register("quantity")} className={`form-control ${errors.quantity ? 'is-invalid' : ''}`} placeholder='Ej: 10, 20...' min="1" />
                    {errors.quantity && <div className="invalid-feedback">{errors.quantity.message}</div>}
                </div>
                <div className="col-md-8">
                  <label className="form-label">Observación</label>
                  <textarea {...register("description")} className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="3" placeholder="Ej: Compra a proveedor..."></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Boton type="submit" color="morado">{isCreateMode ? 'Guardar Movimiento' : 'Actualizar Movimiento'}</Boton>
                <Boton type="button" color="blanco" onClick={handleCancelClick}>Cancelar</Boton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementFormModal;