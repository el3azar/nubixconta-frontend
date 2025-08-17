import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { CustomerForm } from './CustomerForm';
import { Notifier } from '../../../utils/alertUtils';

const NewCustomer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createCustomer } = useCustomerService();

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      Notifier.success('Cliente creado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/ventas/clientes');
    }, onError: (error) => {
      const message = error.response?.data?.message || 'No se pudo crear el cliente.';
      Notifier.showError('Error al Crear', message);
    },
  });

 return (
  <div className="w-100">
    <CustomerForm onFormSubmit={mutate} isSubmitting={isPending} />
  </div>
);
}
export default NewCustomer;
