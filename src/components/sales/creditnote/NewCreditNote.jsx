// src/components/sales/creditnote/NewCreditNote.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService } from '../../../services/sales/SaleService';
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { useCustomerService } from '../../../services/sales/customerService';
import { useCreditNoteForm } from '../../../hooks/useCreditNoteForm';
import { SelectableSalesTable } from './SelectableSalesTable';
import { CreditNoteForm } from './CreditNoteForm';
import Swal from 'sweetalert2';
import styles from '../../../styles/sales/NewCreditNote.module.css';

export default function NewCreditNote() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saleService = SaleService();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();
  const [selectedSale, setSelectedSale] = useState(null);

  // Se instancia el hook, que ahora maneja su propia lógica interna
  const formLogic = useCreditNoteForm();
  const { fields, remove, updateFormWithSaleDetails, setValue } = formLogic;

  // Efecto para establecer el clientId en el formulario una vez que esté disponible.
  useEffect(() => {
    if (clientId) {
      setValue('clientId', parseInt(clientId, 10));
    }
  }, [clientId, setValue]);

  // Query para obtener la info del cliente
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', clientId],
    queryFn: () => getCustomerById(clientId),
    enabled: !!clientId,
  });

  // Query para obtener las ventas aplicadas del cliente
  const { data: appliedSales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['appliedSales', clientId],
    queryFn: () => saleService.getAppliedSalesByCustomer(clientId),
    enabled: !!clientId,
  });

  // Mutación para CREAR la nota de crédito
  const { mutate: submitCreditNote, isPending: isSaving } = useMutation({
    mutationFn: (data) => creditNoteService.createCreditNote(data),
    onSuccess: (savedNote) => {
      Swal.fire('¡Éxito!', `Nota de crédito #${savedNote.documentNumber} registrada.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      navigate('/ventas/notas-credito');
    },
    onError: (error) => {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar la nota de crédito.', 'error');
    }
  });

  const handleSaleSelect = (sale) => {
    setSelectedSale(sale);
    updateFormWithSaleDetails(sale);
  };
  
  const handleCancel = () => {
    Swal.fire({
      title: '¿Cancelar Creación?',
      text: 'Perderás todos los datos ingresados en el formulario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/ventas/notas-credito');
      }
    });
  };

  /**
   * Función que se pasa al formulario para el submit.
   * Ahora delega toda la preparación de datos al hook.
   */
  const onFormSubmit = (formData) => {
    const finalDTO = formLogic.prepareSubmitData(formData);
    submitCreditNote(finalDTO);
  };

  if (isLoadingCustomer) return <div className={styles.container}><h2>Cargando datos...</h2></div>;
  if (!customerData && !isLoadingCustomer) return <div className={styles.container}><h2>Cliente no encontrado.</h2></div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Nueva Nota de Crédito</h2>
      <SelectableSalesTable
        sales={appliedSales}
        selectedSaleId={selectedSale?.saleId}
        onSaleSelect={handleSaleSelect}
        isLoading={isLoadingSales}
      />
      
      {selectedSale && (
        <CreditNoteForm
          customer={customerData}
          formMethods={formLogic}
          fields={fields}
          remove={remove}
          onCancel={handleCancel}
          isSaving={isSaving}
          onSubmit={onFormSubmit}
          submitButtonText="Registrar Nota de Crédito"
        />
      )}
    </div>
  );
}