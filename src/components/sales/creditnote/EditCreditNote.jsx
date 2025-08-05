// src/components/sales/creditnote/EditCreditNote.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { useCreditNoteForm } from '../../../hooks/useCreditNoteForm';
import CreditNoteForm  from './CreditNoteForm';
import Swal from 'sweetalert2';
import { useCustomerService } from '../../../services/sales/customerService';

export default function EditCreditNote() {
  const { creditNoteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();

 const formLogic = useCreditNoteForm();
  // --- INICIO DE LA CORRECCIÓN ---
  const { fields, remove, prepareSubmitData, formMethods } = formLogic;
  const { setValue } = formMethods;
  // --- FIN DE LA CORRECCIÓN ---

  const { data: creditNoteToEdit, isLoading } = useQuery({
    queryKey: ['creditNote', creditNoteId],
    queryFn: () => creditNoteService.getCreditNoteById(creditNoteId),
    enabled: !!creditNoteId,
  });
  
  const customerId = creditNoteToEdit?.sale?.customer?.clientId;
  const { data: fullCustomerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (creditNoteToEdit) {
      if (creditNoteToEdit.creditNoteStatus !== 'PENDIENTE') {
        Swal.fire({
          icon: 'error',
          title: 'Acción no permitida',
          text: `No se puede editar una nota de crédito en estado "${creditNoteToEdit.creditNoteStatus}".`,
        }).then(() => navigate('/ventas/notas-credito'));
        return;
      }
      
      setValue('documentNumber', creditNoteToEdit.documentNumber);
      setValue('description', creditNoteToEdit.description);
      setValue('saleId', creditNoteToEdit.sale.saleId);

      const detailsForForm = creditNoteToEdit.details.map(d => ({
        ...d,
        product: d.productId 
          ? { idProduct: d.productId, productName: d.productName, productCode: d.productCode || 'N/A' }
          : null,
        impuesto: creditNoteToEdit.vatAmount > 0,
      }));
      setValue('details', detailsForForm);
    }
  }, [creditNoteToEdit, setValue, navigate]);

  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => creditNoteService.updateCreditNote(creditNoteId, data),
    onSuccess: (updatedNote) => {
      Swal.fire('¡Actualizado!', `Nota de crédito #${updatedNote.documentNumber} guardada.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['creditNote', creditNoteId] });
      navigate('/ventas/notas-credito');
    },
    onError: (error) => {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar la nota de crédito.', 'error');
    }
  });
  
  const handleCancel = () => {
    Swal.fire({
      title: '¿Descartar Cambios?',
      text: 'Los cambios que hayas realizado no se guardarán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'No, continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/ventas/notas-credito');
      }
    });
  };

  const onFormSubmit = (formData) => {
    const updateDTO = formLogic.prepareSubmitData(formData);
    submitUpdate(updateDTO);
  };

  if (isLoading || (creditNoteToEdit && isLoadingCustomer)) {
    return <main className="container-lg text-center p-5"><h2>Cargando datos...</h2></main>;
  }
  
  if (!creditNoteToEdit) {
    return <main className="container-lg text-center p-5"><h2>Nota de crédito no encontrada.</h2></main>;
  }

  return (
    <CreditNoteForm
       title="Editar Nota de Crédito"
      customer={fullCustomerData}
      // --- INICIO DE LA CORRECCIÓN ---
      formMethods={formLogic.formMethods} // Se pasa el objeto correcto
      fields={fields}
      remove={remove}
      // --- FIN DE LA CORRECCIÓN ---
      onCancel={handleCancel}
      isSaving={isSaving}
      onSubmit={onFormSubmit}
      submitButtonText="Guardar Cambios"
    />
  );
}