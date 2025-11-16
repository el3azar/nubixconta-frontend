// src/components/purchases/incometax/NewIncomeTax.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { usePurchaseService } from '../../../services/purchases/PurchaseService';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { useIncomeTaxService } from '../../../services/purchases/IncomeTaxService';
import { useIncomeTaxForm } from '../../../hooks/useIncomeTaxForm';
import { IncomeTaxForm } from './IncomeTaxForm';
import { SelectablePurchasesForISR } from './SelectablePurchasesForISR';
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';

const NewIncomeTax = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const purchaseService = usePurchaseService();
  const supplierService = useSupplierService();
  const incomeTaxService = useIncomeTaxService();
  const formLogic = useIncomeTaxForm();
  const { formMethods, populateFormWithPurchase, prepareSubmitData } = formLogic;

  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => supplierService.getById(supplierId),
    enabled: !!supplierId,
  });

  const { data: availablePurchases = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['availablePurchasesForISR', supplierId],
    queryFn: () => purchaseService.getAvailableForISR(supplierId),
    enabled: !!supplierId,
  });
  
  const { mutate: createIncomeTax, isPending: isSaving } = useMutation({
    mutationFn: incomeTaxService.create,
    onSuccess: (data) => {
      Notifier.success(`Retención ISR ${data.documentNumber} registrada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['incomeTaxes'] });
      navigate('/compras/isr');
    },
    onError: (error) => Notifier.error(error.response?.data?.message || 'Error al registrar la retención.'),
  });

  const handlePurchaseSelect = (purchaseSummary) => {
    const fullPurchaseLoader = toast.loading('Cargando detalles de la compra...');
    purchaseService.getPurchaseById(purchaseSummary.idPurchase)
      .then(fullPurchaseData => {
        toast.dismiss(fullPurchaseLoader);
        setSelectedPurchase(fullPurchaseData);
        populateFormWithPurchase(fullPurchaseData);
      })
      .catch(() => {
        toast.dismiss(fullPurchaseLoader);
        Notifier.error("No se pudieron cargar los detalles de la compra.");
      });
  };

  // --- CAMBIO CLAVE: Añadimos confirmación al cancelar ---
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás la información ingresada.',
      confirmButtonText: 'Sí, descartar'
    });
    if (result.isConfirmed) {
      navigate('/compras/isr');
    }
  };

  const onFormSubmit = (formData) => {
    const dataToSubmit = prepareSubmitData(formData);
    if (dataToSubmit) {
      createIncomeTax(dataToSubmit);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Nuevo Impuesto Sobre la Renta</h1>
      <SelectablePurchasesForISR
        purchases={availablePurchases}
        selectedPurchaseId={selectedPurchase?.idPurchase}
        onPurchaseSelect={handlePurchaseSelect}
        isLoading={isLoadingPurchases}
      />
      {selectedPurchase && (
        <FormProvider {...formMethods}>
          <IncomeTaxForm
            supplierData={supplierData}
            isLoadingSupplier={isLoadingSupplier}
            // --- CAMBIO CLAVE: Pasamos la compra seleccionada para mostrar sus totales ---
            selectedPurchase={selectedPurchase}
            onFormSubmit={onFormSubmit}
            isSaving={isSaving}
            onCancel={handleCancel}
            isEditMode={false}
          />
        </FormProvider>
      )}
    </main>
  );
};

export default NewIncomeTax;