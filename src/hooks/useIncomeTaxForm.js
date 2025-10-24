// src/hooks/useIncomeTaxForm.js

import { useEffect, useCallback } from 'react'; // --- CAMBIO CLAVE #1: Importar useCallback ---
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeTaxSchema } from '../schemas/incomeTaxSchema';

export const useIncomeTaxForm = () => {
  const formMethods = useForm({
    resolver: zodResolver(incomeTaxSchema),
    defaultValues: {
      purchaseId: null,
      documentNumber: '',
      description: '',
      issueDate: new Date().toISOString().split('T')[0],
      amountIncomeTax: '',
      _purchaseTotalAmount: 0,
    },
    mode: 'onBlur',
  });
  const { setValue, reset, trigger } = formMethods;

  // --- CAMBIO CLAVE #2: Envolvemos las funciones en useCallback para estabilizarlas ---

  const populateFormWithPurchase = useCallback((purchase) => {
    if (!purchase) return;
    setValue('purchaseId', purchase.idPurchase, { shouldValidate: true });
    setValue('_purchaseTotalAmount', purchase.totalAmount, { shouldValidate: true });
    setValue('description', `Retención ISR sobre compra N° ${purchase.documentNumber}`);
    trigger('amountIncomeTax');
  }, [setValue, trigger]); // Las dependencias son estables

  const populateFormForEdit = useCallback((incomeTaxData) => {
    if (!incomeTaxData) return;
    const purchase = incomeTaxData.purchase;
    const formattedDate = incomeTaxData.issueDate ? incomeTaxData.issueDate.substring(0, 10) : '';

    reset({
      purchaseId: purchase.idPurchase,
      documentNumber: incomeTaxData.documentNumber,
      description: incomeTaxData.description,
      issueDate: formattedDate,
      amountIncomeTax: incomeTaxData.amountIncomeTax,
      _purchaseTotalAmount: purchase.totalAmount,
    });
  }, [reset]); // La dependencia es estable

  const prepareSubmitData = useCallback((formData) => {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const localDateTimeString = `${formData.issueDate}T${timeString}`;

    return {
      purchaseId: formData.purchaseId,
      documentNumber: formData.documentNumber,
      description: formData.description,
      issueDate: localDateTimeString,
      amountIncomeTax: formData.amountIncomeTax,
    };
  }, []); // Sin dependencias

  return {
    formMethods,
    populateFormWithPurchase,
    populateFormForEdit,
    prepareSubmitData,
  };
};