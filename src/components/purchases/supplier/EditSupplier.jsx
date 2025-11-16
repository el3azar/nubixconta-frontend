import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { EntityForm } from '../../shared/form/EntityForm';
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { Notifier } from '../../../utils/alertUtils';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Obtenemos la configuración y el servicio para 'supplier'.
  const supplierConfig = ENTITY_CONFIG.supplier;
  const supplierService = useSupplierService();

  // 2. Usamos useQuery para obtener los datos del proveedor a editar.
  const { data: supplier, isLoading, isError } = useQuery({
    queryKey: [supplierConfig.queryKey, id], // queryKey específico para este item
    queryFn: () => supplierService.getById(id),
    staleTime: 1000 * 60 * 5,
  });

  // 3. Configuramos la mutación para usar el método 'update' del servicio.
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => supplierService.update({ id, payload: data }),
    onSuccess: () => {
      Notifier.success(`${supplierConfig.entityName} actualizado correctamente.`);
      queryClient.invalidateQueries({ queryKey: [supplierConfig.queryKey] });
      queryClient.invalidateQueries({ queryKey: [supplierConfig.queryKey, id] });
      navigate(supplierConfig.basePath);
    },
    onError: (error) => {
      const message = error.response?.data?.message || `No se pudo actualizar el ${supplierConfig.entityName}.`;
      Notifier.showError('Error al Actualizar', message);
    },
  });

  if (isLoading) return <p>Cargando datos del {supplierConfig.entityName}...</p>;
  if (isError) return <p>Error al cargar los datos. Por favor, intente de nuevo.</p>;

  // 4. Renderizamos el formulario genérico con los datos y el modo de edición activado.
  return (
    <div className="w-100">
      <EntityForm
        entityType="supplier"
        config={supplierConfig}
        onFormSubmit={mutate}
        defaultValues={supplier}
        isSubmitting={isPending}
        isEditMode={true}
      />
    </div>
  );
};

export default EditSupplier;