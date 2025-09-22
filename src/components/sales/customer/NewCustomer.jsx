// src/components/sales/customer/NewCustomer.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 1. Importamos el formulario genérico y los componentes de la nueva arquitectura.
import { EntityForm } from '../../shared/form/EntityForm';
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useCustomerService } from '../../../services/sales/customerService';
import { Notifier } from '../../../utils/alertUtils';

/**
 * Componente Contenedor para la creación de un nuevo Cliente.
 * Refactorizado para usar el componente genérico EntityForm.
 */
const NewCustomer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 2. Obtenemos la configuración y el servicio para 'customer'.
  const customerConfig = ENTITY_CONFIG.customer;
  const customerService = useCustomerService();

  // 3. La mutación ahora usa el método genérico 'create' del servicio.
  const { mutate, isPending } = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      Notifier.success(`${customerConfig.entityName} creado correctamente.`);
      queryClient.invalidateQueries({ queryKey: [customerConfig.queryKey] });
      navigate(customerConfig.basePath);
    },
    onError: (error) => {
      const message = error.response?.data?.message || `No se pudo crear el ${customerConfig.entityName}.`;
      Notifier.showError('Error al Crear', message);
    },
  });

  // 4. Renderizamos el formulario genérico.
  return (
    <div className="w-100">
      <EntityForm
        entityType="customer"
        config={customerConfig}
        onFormSubmit={mutate}
        isSubmitting={isPending}
        isEditMode={false}
      />
    </div>
  );
};

export default NewCustomer;