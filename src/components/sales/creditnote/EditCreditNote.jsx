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


const IVA_RATE = 0.13; // Tasa de IVA


export default function EditCreditNote() {
  const { creditNoteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creditNoteService = CreditNoteService();
  const { getCustomerById } = useCustomerService();

  // 1. Capturamos el objeto COMPLETO que devuelve el hook en una sola variable.
  const formLogic = useCreditNoteForm(); // Lo llamamos sin clientId, lo cual ahora es válido

  // 2. Extraemos las piezas que necesitamos, incluyendo 'reset'.
  const { fields, remove, reset } = formLogic;
  
  // Query para obtener los datos de la nota de crédito a editar.
  const { data: creditNoteToEdit, isLoading } = useQuery({
    queryKey: ['creditNote', creditNoteId],
    queryFn: () => creditNoteService.getCreditNoteById(creditNoteId),
    enabled: !!creditNoteId,
  });
  
   // Query 2: Obtener los datos COMPLETOS del cliente.
  // Esta query es DEPENDIENTE de la primera.
  const customerId = creditNoteToEdit?.sale?.customer?.clientId;
  const { data: fullCustomerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerById(customerId),
    // La opción 'enabled' es la clave: esta query NO se ejecutará
    // hasta que 'customerId' tenga un valor válido (es decir, hasta que la Query 1 termine).
    enabled: !!customerId,
  });

  // Efecto para poblar el formulario cuando los datos se cargan.
 useEffect(() => {
    if (creditNoteToEdit) {
         // Transformamos explícitamente la estructura de los detalles.
      const detailsForForm = creditNoteToEdit.details.map(d => ({
        // Copiamos todas las propiedades que ya coinciden (quantity, unitPrice, etc.)
        ...d,
        
        // Creamos el objeto 'product' anidado que el formulario espera.
        product: d.productId 
          ? {
              idProduct: d.productId,
              productName: d.productName,
              // El DTO de detalle no incluye el código, así que lo dejamos como 'N/A'.
              // El formulario ya sabe cómo manejar esto.
              productCode: d.productCode || 'N/A',
            }
          : null,
          
        // Añadimos la bandera del impuesto
        impuesto: creditNoteToEdit.vatAmount > 0,
      }));
      reset({
        documentNumber: creditNoteToEdit.documentNumber,
        description: creditNoteToEdit.description,
        saleId: creditNoteToEdit.sale.saleId,
        details: detailsForForm,
        subtotalAmount: creditNoteToEdit.subtotalAmount,
        vatAmount: creditNoteToEdit.vatAmount,
        totalAmount: creditNoteToEdit.totalAmount,
      });
    }
  }, [creditNoteToEdit, reset]);

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
  
 // Añadimos una alerta de confirmación con un mensaje ligeramente diferente para la edición.
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

  // Función que se pasa al formulario para el submit.
 const onFormSubmit = (formData) => {
    // 1. Recalculamos los totales y los subtotales de línea para garantizar consistencia.
    const calculatedSubtotal = formData.details.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculatedVat = formData.details.reduce((sum, item) => {
      return item.impuesto ? sum + (item.quantity * item.unitPrice * IVA_RATE) : sum;
    }, 0);
    const calculatedTotal = calculatedSubtotal + calculatedVat;
    
    const cleanDetails = formData.details.map(({ impuesto, product, saleDetailId, ...rest }) => ({
      ...rest,
      subtotal: parseFloat((rest.quantity * rest.unitPrice).toFixed(2))
    }));

    // 2. Construimos el DTO de actualización con los datos correctos.
    const updateDTO = {
      documentNumber: formData.documentNumber,
      description: formData.description,
      details: cleanDetails,
      subtotalAmount: parseFloat(calculatedSubtotal.toFixed(2)),
      vatAmount: parseFloat(calculatedVat.toFixed(2)),
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
    };

    submitUpdate(updateDTO);
  };

  if (isLoading) return <div className={styles.container}><h2>Cargando datos de la nota de crédito...</h2></div>;
  if (!creditNoteToEdit) return <div className={styles.container}><h2>Nota de crédito no encontrada.</h2></div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Editar Nota de Crédito</h2>
      {/* En edición, solo mostramos el formulario, no la tabla de selección de ventas. */}
      <CreditNoteForm
        customer={fullCustomerData}
        formMethods={formLogic} // Pasamos el objeto completo
        fields={fields}
        remove={remove}
        onCancel={handleCancel}
        isSaving={isSaving}
        onSubmit={onFormSubmit} // Le pasamos el manejador del submit
        submitButtonText="Guardar Cambios"
      />
    </div>
  );
}