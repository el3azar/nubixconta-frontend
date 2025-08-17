// src/components/sales/sales/NewSale.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { SaleService } from '../../../services/sales/SaleService';
import { useSaleForm } from '../../../hooks/useSaleForm';
import SaleForm from './SaleForm';
import { Notifier } from '../../../utils/alertUtils';
import { useActiveProducts } from '../../../hooks/useProductQueries'; 
export default function NewSale() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { createSale } = SaleService();
  const { data: activeProducts, isLoading: isLoadingProducts } = useActiveProducts();
  const { getCustomerById } = useCustomerService();
  
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['customer', clientId],
    queryFn: () => getCustomerById(clientId),
    enabled: !!clientId,
  });

 const productOptions = React.useMemo(() => {
    if (!activeProducts) return [];
    return activeProducts.map(p => ({ 
        value: p.idProduct, 
        label: p.productName, 
        codigo: p.productCode, 
        idProduct: p.idProduct 
    }));
  }, [activeProducts]);

  const formLogic = useSaleForm();

  useEffect(() => {
    if (clientId) {
      formLogic.formMethods.setValue('clientId', parseInt(clientId, 10));
    }
  }, [clientId, formLogic.formMethods.setValue]);

  const { mutate: submitSale, isPending: isSaving } = useMutation({
    mutationFn: (saleData) => createSale(saleData),
    onSuccess: (savedSale) => {
      Notifier.success(`Venta #${savedSale.documentNumber} registrada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      navigate('/ventas/ventas');
    },
    onError: (error) => {
     Notifier.showError('Error al Registrar', error.response?.data?.message || 'Ocurrió un error.');
    }
  });

  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    submitSale(dto);
  };

 

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
      submitButtonText="Registrar Venta"
    />
  );
}