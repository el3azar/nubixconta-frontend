// src/components/purchases/purchases/EditPurchase.jsx

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Servicios y Hooks específicos del módulo
import { usePurchaseService } from '../../../services/purchases/PurchaseService';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { usePurchaseForm } from '../../../hooks/usePurchaseForm';
import PurchaseForm from './PurchaseForm';

// Utilidades y hooks compartidos
import { Notifier } from '../../../utils/alertUtils';
import { useActiveProducts } from '../../../hooks/useProductQueries';

export default function EditPurchase() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Instanciamos servicios y el hook de lógica del formulario
  const purchaseService = usePurchaseService();
  const supplierService = useSupplierService();
  const formLogic = usePurchaseForm();
  
  // 2. Obtenemos los datos necesarios con React Query
  //    a) La compra que se va a editar
  const { data: purchaseToEdit, isLoading: isLoadingPurchase, isError } = useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: () => purchaseService.getPurchaseById(purchaseId),
    enabled: !!purchaseId,
  });

  //    b) El proveedor de la compra (query dependiente)
  const { data: supplier, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', purchaseToEdit?.supplier?.idSupplier], // Ajusta el path si es necesario
    queryFn: () => supplierService.getById(purchaseToEdit.supplier.idSupplier),
    enabled: !!purchaseToEdit?.supplier?.idSupplier,
  });

  //    c) La lista de productos activos
  const { data: activeProducts, isLoading: isLoadingProducts } = useActiveProducts();

  const productOptions = useMemo(() => {
    if (!activeProducts) return [];
    return activeProducts.map(p => ({ 
        value: p.idProduct, 
        label: `${p.productName} (${p.productCode})`,
        codigo: p.productCode, 
        idProduct: p.idProduct 
    }));
  }, [activeProducts]);

  // 3. Efecto para poblar el formulario cuando los datos de la compra están listos
  useEffect(() => {
    if (purchaseToEdit) {
      // VALIDACIÓN DE NEGOCIO EN EL FRONTEND (Crucial para la UX)
      if (purchaseToEdit.purchaseStatus !== 'PENDIENTE') {
        Notifier.showError(
          'Acción no permitida',
          `No se puede editar una compra en estado "${purchaseToEdit.purchaseStatus}".`
        ).then(() => navigate('/compras/compras'));
        return;
      }

      const { setValue } = formLogic.formMethods;
      
      // Poblamos la cabecera del formulario
      setValue('supplierId', purchaseToEdit.supplier.idSupplier);
      setValue('documentNumber', purchaseToEdit.documentNumber);
      setValue('purchaseDescription', purchaseToEdit.purchaseDescription);
      // El input de fecha necesita el formato YYYY-MM-DD
      setValue('issueDate', purchaseToEdit.issueDate.split('T')[0]);

      // Poblamos los detalles, transformando la data para la UI
      const detailsForForm = purchaseToEdit.purchaseDetails.map(detail => ({
        productId: detail.product ? detail.product.idProduct : null,
        catalogId: detail.catalog ? detail.catalog.id : null,
        lineDescription: detail.lineDescription, 
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal,
        tax: detail.tax,
        // Campos temporales para la visualización en la tabla
        _displayName: detail.product?.productName || detail.catalog?.accountName,
        _displayCode: detail.product?.productCode || detail.catalog?.accountCode,
      }));
      setValue('purchaseDetails', detailsForForm);
    }
  }, [purchaseToEdit, formLogic.formMethods.setValue, navigate]);

  // 4. Configuramos la mutación para actualizar la compra
  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => purchaseService.updatePurchase(data.purchaseId, data.dto),
    onSuccess: (updatedPurchase) => {
      Notifier.success(`Compra #${updatedPurchase.documentNumber} actualizada con éxito.`);
      // Invalidamos las queries para refrescar los datos en la lista y en esta misma vista
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', purchaseId] });
      navigate('/compras/compras');
    },
    onError: (error) => {
      Notifier.showError('Error al Actualizar', error.response?.data?.message || 'Ocurrió un error.');
    },
  });

  // 5. Función de envío que se pasará al formulario
  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    submitUpdate({ purchaseId, dto });
  };
  


  // 7. Renderizamos el componente de presentación
  return (
    <PurchaseForm
      title="Editar Compra"
      supplier={supplier}
      isLoadingSupplier={isLoadingSupplier}
      productOptions={productOptions}
      isLoadingProducts={isLoadingProducts}
      isSaving={isSaving}
      formLogic={formLogic}
      onFormSubmit={onFormSubmit}
      submitButtonText="Guardar Cambios"
    />
  );
}