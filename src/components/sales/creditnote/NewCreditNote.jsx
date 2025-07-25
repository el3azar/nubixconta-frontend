// src/components/sales/creditnote/NewCreditNote.jsx

import React, { useState } from 'react';
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


const IVA_RATE = 0.13;

export default function NewCreditNote() {
   const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saleService = SaleService();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();
  const [selectedSale, setSelectedSale] = useState(null);
  const formLogic = useCreditNoteForm(clientId);
  const { fields, remove, updateFormWithSaleDetails } = formLogic;

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
  
 // Añadimos una alerta de confirmación antes de navegar.
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

  // Función que se pasa al formulario para el submit.
   const onFormSubmit = (formData) => {
    // 1. Recalcular los totales desde cero usando los datos validados de 'formData.details'.
    // Esto garantiza una consistencia perfecta.
    const calculatedSubtotal = formData.details.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculatedVat = formData.details.reduce((sum, item) => {
      return item.impuesto ? sum + (item.quantity * item.unitPrice * IVA_RATE) : sum;
    }, 0);
    const calculatedTotal = calculatedSubtotal + calculatedVat;
    
    // 2. Limpiamos los campos extra que no necesita el DTO.
    const cleanDetails = formData.details.map(({ impuesto, product, saleDetailId, ...rest }) => ({
      ...rest,
      subtotal: parseFloat((rest.quantity * rest.unitPrice).toFixed(2)) // Aseguramos el subtotal de línea
    }));

    // 3. Construimos el DTO final usando los totales recién calculados.
    const finalDTO = {
      documentNumber: formData.documentNumber,
      description: formData.description,
      saleId: formData.saleId,
      details: cleanDetails,
      subtotalAmount: parseFloat(calculatedSubtotal.toFixed(2)),
      vatAmount: parseFloat(calculatedVat.toFixed(2)),
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
    };

    console.log("✅ Datos consistentes, enviando DTO a la API:", finalDTO);
    submitCreditNote(finalDTO);
  };

  if (isLoadingCustomer) return <div className={styles.container}><h2>Cargando datos...</h2></div>;
  if (!customerData) return <div className={styles.container}><h2>Cliente no encontrado.</h2></div>;

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
          formMethods={formLogic} // Pasamos el objeto completo de métodos del formulario
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