// src/components/sales/creditnote/EditCreditNote.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { useCreditNoteForm } from '../../../hooks/useCreditNoteForm';
import { CreditNoteForm } from './CreditNoteForm';
import Swal from 'sweetalert2';
import styles from '../../../styles/sales/NewCreditNote.module.css';
import { useCustomerService } from '../../../services/sales/customerService';

export default function EditCreditNote() {
  const { creditNoteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();

  // Se instancia el hook
  const formLogic = useCreditNoteForm();
  const { fields, remove, reset, setValue } = formLogic;

  // Query para obtener los datos de la nota de crédito a editar.
  const { data: creditNoteToEdit, isLoading } = useQuery({
    queryKey: ['creditNote', creditNoteId],
    queryFn: () => creditNoteService.getCreditNoteById(creditNoteId),
    enabled: !!creditNoteId,
  });
  
  // Query para obtener los datos del cliente, dependiente de la primera.
  const customerId = creditNoteToEdit?.sale?.customer?.clientId;
  const { data: fullCustomerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
  });

  // Efecto para poblar el formulario cuando los datos se cargan.
  useEffect(() => {
    if (creditNoteToEdit) {
      // Regla de negocio: No se pueden editar NC que no estén PENDIENTES.
      if (creditNoteToEdit.creditNoteStatus !== 'PENDIENTE') {
        Swal.fire({
          icon: 'error',
          title: 'Acción no permitida',
          text: `No se puede editar una nota de crédito en estado "${creditNoteToEdit.creditNoteStatus}".`,
        }).then(() => navigate('/ventas/notas-credito'));
        return;
      }
      
    // --- INICIO DE LA CORRECCIÓN FINAL ---
      // Se construye el objeto para el formulario, sobreescribiendo explícitamente
      // la 'issueDate' con la fecha actual para que sea un string válido.
      const formValues = {
        ...creditNoteToEdit, // Se toman todos los valores de la nota a editar...
        issueDate: new Date().toISOString().slice(0, 10), // ...pero se reemplaza la fecha por la de hoy.
        saleId: creditNoteToEdit.sale.saleId,
        details: creditNoteToEdit.details.map(d => ({
          ...d,
          product: d.productId 
            ? { idProduct: d.productId, productName: d.productName, productCode: d.productCode || 'N/A' }
            : null,
          impuesto: creditNoteToEdit.vatAmount > 0,
        })),
      };

      reset(formValues); // Se puebla el formulario con un objeto que tiene una 'issueDate' válida.
      // --- FIN DE LA CORRECCIÓN FINAL ---
    }
  }, [creditNoteToEdit, reset, navigate]);

  // Mutación para ACTUALIZAR la nota de crédito
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

  /**
   * Función que se pasa al formulario para el submit.
   * Delega la preparación de datos al hook.
   */
  const onFormSubmit = (formData) => {
    const updateDTO = formLogic.prepareSubmitData(formData);
    submitUpdate(updateDTO);
  };

  if (isLoading || (creditNoteToEdit && isLoadingCustomer)) {
    return <div className={styles.container}><h2>Cargando datos de la nota de crédito...</h2></div>;
  }
  
  if (!creditNoteToEdit) {
    return <div className={styles.container}><h2>Nota de crédito no encontrada.</h2></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Editar Nota de Crédito</h2>
      <CreditNoteForm
        customer={fullCustomerData}
        formMethods={formLogic}
        fields={fields}
        remove={remove}
        onCancel={handleCancel}
        isSaving={isSaving}
        onSubmit={onFormSubmit}
        submitButtonText="Guardar Cambios"
      />
    </div>
  );
}