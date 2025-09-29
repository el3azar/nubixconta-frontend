import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EntityForm } from '../../shared/form/EntityForm';
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { Notifier } from '../../../utils/alertUtils';

const NewSupplier = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 1. Obtenemos la configuración y el servicio para 'supplier'.
  const supplierConfig = ENTITY_CONFIG.supplier;
  const supplierService = useSupplierService();

  // 2. Configuramos la mutación para usar el método 'create' del servicio.
  const { mutate, isPending } = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      Notifier.success(`${supplierConfig.entityName} creado correctamente.`);
      // Invalida la query usando la key de la configuración.
      queryClient.invalidateQueries({ queryKey: [supplierConfig.queryKey] });
      navigate(supplierConfig.basePath);
    },
    onError: (error) => {
      const message = error.response?.data?.message || `No se pudo crear el ${supplierConfig.entityName}.`;
      Notifier.showError('Error al Crear', message);
    },
  });

  // 3. Renderizamos el formulario genérico con las props adecuadas.
  return (
    <div className="w-100">
      <EntityForm
        entityType="supplier"
        config={supplierConfig}
        onFormSubmit={mutate}
        isSubmitting={isPending}
        isEditMode={false}
      />
    </div>
  );
};

export default NewSupplier;