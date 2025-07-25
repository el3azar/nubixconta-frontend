// src/components/sales/sales/NewSale.jsx
import React from 'react';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { useProductService } from '../../../services/inventory/useProductService';
import { SaleService } from '../../../services/sales/SaleService';
import { useSaleForm } from '../../../hooks/useSaleForm';
import SaleForm from './SaleForm';
import Swal from 'sweetalert2';

/**
 * Componente "Contenedor" para crear una nueva venta.
 * RESPONSABILIDADES:
 * 1. Cargar datos necesarios (cliente, productos) usando React Query.
 * 2. Instanciar el hook `useSaleForm` para obtener toda la lógica del formulario.
 * 3. Configurar y ejecutar la mutación de `createSale`.
 * 4. Renderizar el componente de presentación `SaleForm` pasándole los datos y la lógica.
 */
export default function NewSale() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Servicios
  const { createSale } = SaleService();
  const { getActiveProducts } = useProductService();
  const { getCustomerById } = useCustomerService();
  
  // 1. LÓGICA DE DATOS (QUERIES)
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['customer', clientId],
    queryFn: () => getCustomerById(clientId),
    enabled: !!clientId,
  });

  const { data: productOptions, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['activeProducts'],
    queryFn: async () => {
      const products = await getActiveProducts();
      return products.map(p => ({ value: p.idProduct, label: p.productName, codigo: p.productCode, idProduct: p.idProduct }));
    },
    initialData: [],
  });

 // El hook se llama sin argumentos.
  const formLogic = useSaleForm();

  useEffect(() => {
    if (clientId) {
      formLogic.formMethods.setValue('clientId', parseInt(clientId, 10));
    }
  }, [clientId, formLogic.formMethods.setValue]);

  // 3. LÓGICA DE DATOS (MUTATION)
  const { mutate: submitSale, isPending: isSaving } = useMutation({
    mutationFn: (saleData) => createSale(saleData),
    onSuccess: (savedSale) => {
      Swal.fire('Venta Registrada', `Venta #${savedSale.documentNumber} registrada con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      navigate('/ventas/ventas');
    },
    onError: (error) => {
      Swal.fire('Error al Registrar', error.response?.data?.message || 'Ocurrió un error.', 'error');
    }
  });

  // 4. MANEJADORES DE EVENTOS DEL CONTENEDOR
  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    submitSale(dto);
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Cancelar venta?', text: 'Perderás los datos ingresados.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) navigate('/ventas/ventas');
    });
  };

  // 5. RENDERIZADO
  return (
    <SaleForm
      title="Nueva Venta"
      client={client}
      isLoadingClient={isLoadingClient}
      productOptions={productOptions}
      isLoadingProducts={isLoadingProducts}
      isSaving={isSaving}
      formLogic={formLogic}
      onFormSubmit={onFormSubmit}
      onCancel={handleCancel}
      submitButtonText="Registrar Venta"
    />
  );
}