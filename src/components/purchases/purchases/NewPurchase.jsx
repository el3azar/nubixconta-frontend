// src/components/purchases/purchases/NewPurchase.jsx

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Servicios y Hooks específicos del módulo de Compras
import { usePurchaseService } from '../../../services/purchases/PurchaseService';
import { useSupplierService } from '../../../services/purchases/supplierService'; // Asumimos la existencia de este servicio
import { usePurchaseForm } from '../../../hooks/usePurchaseForm';

// Componente de presentación que acabamos de crear
import PurchaseForm from './PurchaseForm';

// Utilidades y hooks compartidos
import { Notifier } from '../../../utils/alertUtils';
import { useActiveProducts } from '../../../hooks/useProductQueries'; // Reutilizamos el hook de productos de ventas

export default function NewPurchase() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 1. Instanciamos los servicios y hooks de lógica
  const purchaseService = usePurchaseService();
  const supplierService = useSupplierService();
  const formLogic = usePurchaseForm();
  
  // 2. Obtenemos los datos necesarios con React Query
  //    a) Datos del proveedor seleccionado
  const { data: supplier, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => supplierService.getById(supplierId),
    enabled: !!supplierId,
  });

  //    b) Lista de productos activos (reutilizando el hook existente)
  const { data: activeProducts, isLoading: isLoadingProducts } = useActiveProducts();

  // 3. Preparamos las opciones para el selector de productos (igual que en ventas)
  const productOptions = useMemo(() => {
    if (!activeProducts) return [];
    return activeProducts.map(p => ({ 
        value: p.idProduct, 
        label: `${p.productName} (${p.productCode})`, 
        codigo: p.productCode, 
        idProduct: p.idProduct 
    }));
  }, [activeProducts]);

  // 4. Seteamos el ID del proveedor en el formulario una vez que esté disponible
  useEffect(() => {
    if (supplierId) {
      formLogic.formMethods.setValue('supplierId', parseInt(supplierId, 10));
    }
  }, [supplierId, formLogic.formMethods.setValue]);

  // 5. Configuramos la mutación para crear la compra
  const { mutate: submitPurchase, isPending: isSaving } = useMutation({
    mutationFn: (purchaseData) => purchaseService.createPurchase(purchaseData),
    onSuccess: (savedPurchase) => {
      Notifier.success(`Compra #${savedPurchase.documentNumber} registrada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      navigate('/compras/compras');
    },
    onError: (error) => {
     Notifier.showError('Error al Registrar', error.response?.data?.message || 'Ocurrió un error en el servidor.');
    }
  });

  // 6. Esta función se pasará al PurchaseForm para manejar el envío
  const onFormSubmit = (formData) => {
    // Usamos la función del hook para limpiar y formatear los datos antes de enviar
    const dto = formLogic.prepareSubmitData(formData);
    submitPurchase(dto);
  };


 
  // 7. Renderizamos el componente de presentación, pasándole todos los datos y la lógica
  return (
    <PurchaseForm
      title="Nueva Compra"
      supplier={supplier}
      isLoadingSupplier={isLoadingSupplier}
      productOptions={productOptions}
      isLoadingProducts={isLoadingProducts}
      isSaving={isSaving}
      formLogic={formLogic}
      onFormSubmit={onFormSubmit}
      submitButtonText="Registrar Compra"
    />
  );
}