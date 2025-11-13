import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccountingTransactionService } from '../../../services/accounting/AccountingService';
import { useAccountingTransactionForm } from '../../../hooks/useAccountingTransactionForm';
import AccountingTransactionForm from './AccountingTransactionForm';
import { Notifier } from '../../../utils/alertUtils';

export default function NewAccountingTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const transactionService = useAccountingTransactionService();
  const formLogic = useAccountingTransactionForm();

  const { mutate: submitTransaction, isPending: isSaving } = useMutation({
    mutationFn: transactionService.create,
    onSuccess: (savedTransaction) => {
      Notifier.success(`Transacción #${savedTransaction.id} registrada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['accountingTransactions'] });
      navigate('/contabilidad/transacciones');
    },
    onError: (error) => {
      Notifier.showError('Error al Registrar', error.response?.data?.message || 'Ocurrió un error.');
    }
  });

  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    submitTransaction(dto);
  };

  return (
    <AccountingTransactionForm
      title="Nueva Transacción Contable"
      isSaving={isSaving}
      formLogic={formLogic}
      onFormSubmit={onFormSubmit}
      submitButtonText="Registrar Transacción"
    />
  );
}