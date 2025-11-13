import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccountingTransactionService } from '../../../services/accounting/AccountingService';
import { useAccountingTransactionForm } from '../../../hooks/useAccountingTransactionForm';
import AccountingTransactionForm from './AccountingTransactionForm';
import { Notifier } from '../../../utils/alertUtils';
import ViewContainer from '../../shared/ViewContainer';

export default function EditAccountingTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const transactionService = useAccountingTransactionService();
  const formLogic = useAccountingTransactionForm();

  // 1. OBTENER DATOS: Buscamos la transacción a editar por su ID.
  const { data: transactionToEdit, isLoading, isError } = useQuery({
    queryKey: ['accountingTransaction', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });

  // 2. POBLAR FORMULARIO: Cuando los datos llegan, los cargamos en el formulario.
   useEffect(() => {
    if (transactionToEdit) {
      if (transactionToEdit.status !== 'PENDIENTE') { /* ... (sin cambios) ... */ }

      const { setValue } = formLogic.formMethods;
      setValue('transactionDate', transactionToEdit.transactionDate.split('T')[0]);
      setValue('description', transactionToEdit.description);
      
      // --- INICIO DE LA CORRECCIÓN ---
      // Ahora leemos el 'catalogId' que viene en el DTO y usamos 'debit'/'credit'.
      const entriesForForm = transactionToEdit.entries.map(entry => ({
        catalogId: entry.catalogId, // <-- Usamos el nuevo campo del DTO
        debit: entry.debit,
        credit: entry.credit,
        _accountCode: entry.accountCode,
        _accountName: entry.accountName,
      }));
      // --- FIN DE LA CORRECCIÓN ---
      
      setValue('entries', entriesForForm);
    }
  }, [transactionToEdit, formLogic.formMethods.setValue, navigate]);

  // 3. CONFIGURAR MUTACIÓN: Preparamos la función para enviar la actualización.
  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => transactionService.update(data),
    onSuccess: (updatedTransaction) => {
      Notifier.success(`Transacción #${updatedTransaction.id} actualizada con éxito.`);
      // Refrescamos los datos en la vista de lista y en esta misma vista.
      queryClient.invalidateQueries({ queryKey: ['accountingTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTransaction', id] });
      navigate('/contabilidad/transacciones');
    },
    onError: (error) => Notifier.showError('Error al Actualizar', error.response?.data?.message || 'Ocurrió un error.'),
  });

  // 4. MANEJADOR DE ENVÍO: Esta función se pasará al formulario.
  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    // Para el DTO de actualización, solo necesitamos la descripción y las entradas.
    const updateDto = {
        description: dto.description,
        entries: dto.entries,
    };
    submitUpdate({ id, data: updateDto });
  };

  // Renderizado condicional mientras se cargan los datos.
  if (isLoading) {
    return (
      <ViewContainer>
        <div className="text-center p-5">Cargando datos de la transacción...</div>
      </ViewContainer>
    );
  }
  
  if (isError) {
     return (
       <ViewContainer>
         <div className="alert alert-danger">Error al cargar la transacción. Por favor, intente de nuevo.</div>
       </ViewContainer>
     );
  }

  // 5. RENDERIZAR FORMULARIO: Pasamos toda la lógica al componente de presentación.
  return (
    <div>
      <ViewContainer>
        <AccountingTransactionForm
          title="Editar Transacción Contable"
          isSaving={isSaving}
          formLogic={formLogic}
          onFormSubmit={onFormSubmit}
          submitButtonText="Guardar Cambios"
        />
      </ViewContainer>
    </div>
  );
}