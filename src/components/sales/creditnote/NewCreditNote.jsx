// src/components/sales/creditnote/NewCreditNote.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService } from '../../../services/sales/SaleService';
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { useCustomerService } from '../../../services/sales/customerService';
import { useCreditNoteForm } from '../../../hooks/useCreditNoteForm';
import { SelectableSalesTable } from './SelectableSalesTable';
import CreditNoteForm  from './CreditNoteForm';
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css'; // Usa el CSS compartido

export default function NewCreditNote() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saleService = SaleService();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();
  const [selectedSale, setSelectedSale] = useState(null);

  const formLogic = useCreditNoteForm();
  // --- INICIO DE LA CORRECCIÓN ---
  // Se desestructura correctamente, accediendo a 'setValue' desde 'formMethods'
  const { fields, remove, updateFormWithSaleDetails, prepareSubmitData, formMethods } = formLogic;
  const { setValue } = formMethods;
  // --- FIN DE LA CORRECCIÓN ---

  useEffect(() => {
    if (clientId) {
      setValue('clientId', parseInt(clientId, 10));
    }
  }, [clientId, setValue]);

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', clientId],
    queryFn: () => getCustomerById(clientId),
    enabled: !!clientId,
    onError: (err) => Notifier.error('No se pudieron cargar los datos del cliente.')
  });

  const { data: appliedSales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['appliedSales', clientId],
    queryFn: () => saleService.getAppliedSalesByCustomer(clientId),
    enabled: !!clientId,
    onError: (err) => Notifier.error('No se pudieron cargar las ventas aplicadas.')
  });

  const { mutate: submitCreditNote, isPending: isSaving } = useMutation({
    mutationFn: (data) => creditNoteService.createCreditNote(data),
    onSuccess: (savedNote) => {
      Notifier.success(`Nota de crédito #${savedNote.documentNumber} registrada.`);
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      navigate('/ventas/notas-credito');
    },
    onError: (error) => {
      Notifier.showError('Error', error.response?.data?.message || 'No se pudo registrar la nota de crédito.');
    }
  });

  const handleSaleSelect = (sale) => {
    setSelectedSale(sale);
    updateFormWithSaleDetails(sale);
  };
  
const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Cancelar Creación?',
      text: 'Perderás todos los datos ingresados en el formulario.',
      confirmButtonText: 'Sí, cancelar'
    });
    if (result.isConfirmed) {
      navigate('/ventas/notas-credito');
    }
  };

  const onFormSubmit = (formData) => {
    const finalDTO = formLogic.prepareSubmitData(formData);
    submitCreditNote(finalDTO);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Nueva Nota de Crédito</h1>
      <SelectableSalesTable
        sales={appliedSales}
        selectedSaleId={selectedSale?.saleId}
        onSaleSelect={handleSaleSelect}
        isLoading={isLoadingSales}
      />
      
      {selectedSale && (
        <CreditNoteForm
          customer={customerData}
          title="Nueva Nota de Crédito"
          // --- INICIO DE LA CORRECCIÓN ---
          formMethods={formLogic.formMethods} // Se pasa el objeto correcto
          fields={fields}
          remove={remove}
          // --- FIN DE LA CORRECCIÓN ---
          onCancel={handleCancel}
          isSaving={isSaving}
          onSubmit={onFormSubmit}
          submitButtonText="Registrar Nota de Crédito"
        />
      )}
    </main>
  );
}