// src/components/purchases/incometax/EditIncomeTax.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider } from 'react-hook-form';
import { IncomeTaxForm } from './IncomeTaxForm';
import { useIncomeTaxForm } from '../../../hooks/useIncomeTaxForm';
import { useIncomeTaxService } from '../../../services/purchases/IncomeTaxService';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';

const EditIncomeTax = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const incomeTaxService = useIncomeTaxService();
  const supplierService = useSupplierService();
  const formLogic = useIncomeTaxForm();
  const { formMethods, populateFormForEdit, prepareSubmitData } = formLogic;

  const { data: existingIncomeTax, isLoading: isLoadingISR, isError } = useQuery({
    queryKey: ['incomeTax', id],
    queryFn: () => incomeTaxService.getById(id),
    enabled: !!id,
  });

  const supplierId = existingIncomeTax?.purchase?.supplier?.idSupplier;

  const { data: fullSupplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplierForISR', supplierId],
    queryFn: () => supplierService.getById(supplierId),
    enabled: !!supplierId,
  });

  const purchaseSummary = existingIncomeTax?.purchase;

  useEffect(() => {
    if (existingIncomeTax) {
      if (existingIncomeTax.incomeTaxStatus !== 'PENDIENTE') {
        Notifier.error('Solo se pueden editar retenciones en estado PENDIENTE.');
        navigate('/compras/isr');
        return;
      }
      populateFormForEdit(existingIncomeTax);
    }
  }, [existingIncomeTax, navigate, populateFormForEdit]);
  
  const { mutate: updateIncomeTax, isPending: isSaving } = useMutation({
    mutationFn: (data) => incomeTaxService.update({ id, data }),
    onSuccess: (data) => {
      Notifier.success(`Retención ISR ${data.documentNumber} actualizada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['incomeTaxes'] });
      queryClient.invalidateQueries({ queryKey: ['incomeTax', id] });
      navigate('/compras/isr');
    },
    onError: (error) => Notifier.error(error.response?.data?.message || 'Error al actualizar la retención.'),
  });

  const onSubmit = (formData) => {
    const dataToSubmit = prepareSubmitData(formData);
    if (dataToSubmit) {
      updateIncomeTax(dataToSubmit);
    }
  };

  // --- CAMBIO CLAVE: Implementamos la alerta de confirmación al cancelar ---
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, los cambios no se guardarán.',
      confirmButtonText: 'Sí, descartar'
    });
    if (result.isConfirmed) {
      navigate('/compras/isr');
    }
  };

  const isLoading = isLoadingISR || isLoadingSupplier;
  if (isLoading && !existingIncomeTax) {
    return <div className="text-center mt-5"><p>Cargando datos de la retención...</p></div>;
  }
  if (isError) {
     return (
        <div className="text-center mt-5 text-danger">
          <p>Error al cargar la retención. Es posible que no exista o haya sido eliminada.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/compras/isr')}>Volver al listado</button>
        </div>
      );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Editar Impuesto Sobre la Renta</h1>
      <FormProvider {...formMethods}>
        <IncomeTaxForm
          supplierData={fullSupplierData}
          selectedPurchase={purchaseSummary}
          isLoadingSupplier={isLoadingSupplier}
          onFormSubmit={onSubmit}
          isSaving={isSaving}
          onCancel={handleCancel}
          isEditMode={true}
        />
      </FormProvider>
    </main>
  );
};

export default EditIncomeTax;