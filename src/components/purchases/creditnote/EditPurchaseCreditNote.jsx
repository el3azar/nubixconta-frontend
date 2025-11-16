// src/components/purchases/creditnote/EditPurchaseCreditNote.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Servicios y Hooks ---
import { usePurchaseCreditNoteService } from '../../../services/purchases/PurchaseCreditNoteService';
import { usePurchaseCreditNoteForm } from '../../../hooks/usePurchaseCreditNoteForm';
import { useSupplierService } from '../../../services/purchases/supplierService';
// --- Componentes de UI ---
import PurchaseCreditNoteForm from './PurchaseCreditNoteForm';

// --- Utilidades ---
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';

export default function EditPurchaseCreditNote() {
  const { creditNoteId } = useParams(); // Asumimos que la ruta será /.../:creditNoteId
  const navigate = useNavigate();
  const queryClient = useQueryClient();

// 1. --- INSTANCIAR SERVICIOS Y HOOKS ---
  const creditNoteService = usePurchaseCreditNoteService();
  const { getById: getSupplierById } = useSupplierService(); // <-- ¡NUEVO! Obtenemos el servicio de proveedor.
  const formLogic = usePurchaseCreditNoteForm();
  const { formMethods } = formLogic;
  const { setValue } = formMethods; 
  // 2. --- OBTENER DATOS (AHORA EN DOS PASOS, COMO EN VENTAS) ---

  //    a) Obtenemos la Nota de Crédito a editar.
  const { data: creditNoteToEdit, isLoading: isLoadingCreditNote } = useQuery({
    queryKey: ['purchaseCreditNote', creditNoteId],
    queryFn: () => creditNoteService.getById(creditNoteId),
    enabled: !!creditNoteId,
  });

  //    b) Extraemos el ID del proveedor de la NC.
  const supplierId = creditNoteToEdit?.purchase?.supplier?.idSupplier;

  //    c) Hacemos una segunda query para obtener los datos COMPLETOS del proveedor.
  const { data: fullSupplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => getSupplierById(supplierId),
    enabled: !!supplierId, // Esta query solo se activa cuando tenemos el supplierId.
  });

  // 3. --- EFECTO PARA POBLAR EL FORMULARIO ---
 useEffect(() => {
    // Solo se ejecuta si tenemos datos y la propiedad 'details' es un array
    if (creditNoteToEdit && Array.isArray(creditNoteToEdit.details)) {
      // Validación de estado (sin cambios)
      if (creditNoteToEdit.creditNoteStatus !== 'PENDIENTE') {
        Notifier.showError('Acción no permitida', `No se puede editar una nota de crédito en estado "${creditNoteToEdit.creditNoteStatus}".`)
          .then(() => navigate('/compras/notas-credito'));
        return;
      }

      // Poblar cabecera (sin cambios)
      setValue('documentNumber', creditNoteToEdit.documentNumber);
      setValue('description', creditNoteToEdit.description);
      setValue('issueDate', creditNoteToEdit.issueDate.split('T')[0]);
      setValue('purchaseId', creditNoteToEdit.purchase.idPurchase);

     // --- LÓGICA DE DETALLES SIMPLIFICADA (IDÉNTICA A VENTAS) ---
      // Transformamos los detalles de la PROPIA NC a la estructura del formulario.
      // Ya no intentamos buscar la "cantidad original".
      const detailsForForm = creditNoteToEdit.details.map(detail => ({
        productId: detail.product ? detail.product.idProduct : null,
        catalogId: detail.catalog ? detail.catalog.id : null,
        
        // La cantidad editable es la cantidad que ya tiene el detalle de la NC.
        quantity: detail.quantity, 
        
        unitPrice: detail.unitPrice,
        tax: detail.tax,
        
        // Campos de visualización.
        _displayName: detail.product?.productName || detail.catalog?.accountName || detail.lineDescription,
        _displayCode: detail.product?.productCode || detail.catalog?.accountCode || 'N/A',
      }));

      // Reemplazamos los detalles en el formulario
      setValue('details', detailsForForm);
    }
  }, [creditNoteToEdit, setValue, navigate]);


  // 4. --- CONFIGURAR LA MUTACIÓN PARA ACTUALIZAR ---
  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => creditNoteService.update(data), // El servicio espera un objeto { id, data }
    onSuccess: (updatedNote) => {
      Notifier.success(`Nota de crédito #${updatedNote.documentNumber} actualizada.`);
      queryClient.invalidateQueries({ queryKey: ['purchaseCreditNotes'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseCreditNote', creditNoteId] });
      navigate('/compras/notas-credito');
    },
    onError: (error) => {
      Notifier.showError('Error al Actualizar', error.response?.data?.message || 'No se pudo actualizar.');
    }
  });

  // 5. --- MANEJADORES DE EVENTOS ---
  const onFormSubmit = (formData) => {
    const finalDTO = formLogic.prepareSubmitData(formData);
    if (finalDTO) {
      // Se envía el ID y el DTO, como espera el servicio.
      submitUpdate({ id: creditNoteId, data: finalDTO });
    }
  };

  const handleCancel = () => {
    navigate('/compras/notas-credito');
  };

  // 6. --- RENDERIZADO CONDICIONAL ---
const isLoading = isLoadingCreditNote || (creditNoteToEdit && isLoadingSupplier);
  if (isLoading) {
    return <main className={styles.container}><h2 className="text-center">Cargando datos...</h2></main>;
  }
  
  if (!creditNoteToEdit) {
    return <main className={styles.container}><h2 className="text-center text-danger">Nota de crédito no encontrada.</h2></main>;
  }
  return (
    <main className={styles.container}>
      <PurchaseCreditNoteForm
        // El proveedor viene anidado en los datos de la NC.
        supplier={fullSupplierData}
        formLogic={formLogic}
        isSaving={isSaving}
        onSubmit={onFormSubmit}
        onCancel={handleCancel}
        submitButtonText="Guardar Cambios"
        isEditMode={true} 
      />
    </main>
  );
}