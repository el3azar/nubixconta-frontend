// src/components/sales/customer/EditCustomer.jsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 1. Importamos el formulario genérico y los componentes de la nueva arquitectura.
import { EntityForm } from '../../shared/form/EntityForm';
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useCustomerService } from '../../../services/sales/customerService';
import { Notifier } from '../../../utils/alertUtils';

/**
 * Componente Contenedor para la edición de un Cliente existente.
 * Refactorizado para usar el componente genérico EntityForm.
 */
const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 2. Obtenemos la configuración y el servicio para 'customer'.
  const customerConfig = ENTITY_CONFIG.customer;
  const customerService = useCustomerService();

  // 3. useQuery ahora usa los métodos y keys de la configuración.
  const { data: customer, isLoading, isError } = useQuery({
    queryKey: [customerConfig.queryKey, id],
    queryFn: () => customerService.getById(id),
    staleTime: 1000 * 60 * 5,
  });

  // 4. useMutation ahora usa el método genérico 'update'.
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => customerService.update({ id, payload: data }),
    onSuccess: () => {
      Notifier.success(`${customerConfig.entityName} actualizado correctamente.`);
      queryClient.invalidateQueries({ queryKey: [customerConfig.queryKey] });
      queryClient.invalidateQueries({ queryKey: [customerConfig.queryKey, id] });
      navigate(customerConfig.basePath);
    },
    onError: (error) => {
      const message = error.response?.data?.message || `No se pudo actualizar el ${customerConfig.entityName}.`;
      Notifier.showError('Error al Actualizar', message);
    },
  });

  if (isLoading) return <p>Cargando datos del {customerConfig.entityName}...</p>;
  if (isError) return <p>Error al cargar los datos. Por favor, intente de nuevo.</p>;

  // 5. Renderizamos el formulario genérico con los datos y el modo de edición.
  return (
    <div className="w-100">
      <EntityForm
        entityType="customer"
        config={customerConfig}
        onFormSubmit={mutate}
        defaultValues={customer}
        isSubmitting={isPending}
        isEditMode={true}
      />
    </div>
  );
};

export default EditCustomer;