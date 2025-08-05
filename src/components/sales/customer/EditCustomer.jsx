import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { CustomerForm } from './CustomerForm';
import Swal from 'sweetalert2';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getCustomerById, updateCustomer } = useCustomerService();

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => updateCustomer({ id, payload }),
    onSuccess: () => {
      Swal.fire('¡Éxito!', 'Cliente actualizado correctamente.', 'success');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/ventas/clientes');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'No se pudo actualizar el cliente.';
      Swal.fire('Error', message, 'error');
    },
  });

  if (isLoading) return <p>Cargando datos del cliente...</p>;
  if (isError) return <p>Error al cargar los datos. Por favor, intente de nuevo.</p>;

  return (

    <div className="w-100">

    <CustomerForm
          onFormSubmit={mutate}
          defaultValues={customer}
          isSubmitting={isPending}
          isEditMode={true}
        />
    </div>
   
  );
};

export default EditCustomer;