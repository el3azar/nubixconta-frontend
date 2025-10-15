// src/components/purchases/creditnote/NewPurchaseCreditNote.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Servicios y Hooks Específicos ---
import { usePurchaseService } from '../../../services/purchases/PurchaseService';
import { usePurchaseCreditNoteService } from '../../../services/purchases/PurchaseCreditNoteService';
import { useSupplierService } from '../../../services/purchases/supplierService';
import { usePurchaseCreditNoteForm } from '../../../hooks/usePurchaseCreditNoteForm';

// --- Componentes de UI ---
import PurchaseCreditNoteForm from './PurchaseCreditNoteForm';
import { SelectablePurchasesTable } from './SelectablePurchasesTable';

// --- Utilidades ---
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';

export default function NewPurchaseCreditNote() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // 1. --- INSTANCIAR SERVICIOS Y HOOKS ---
  const purchaseService = usePurchaseService();
  const creditNoteService = usePurchaseCreditNoteService();
  const supplierService = useSupplierService();
  const formLogic = usePurchaseCreditNoteForm();
  const { updateFormWithPurchaseDetails, formMethods } = formLogic;

  // 2. --- OBTENER DATOS CON REACT QUERY ---
  //    a) Datos del proveedor
  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => supplierService.getById(supplierId),
    enabled: !!supplierId,
  });

  //    b) Compras elegibles para este proveedor
  const { data: availablePurchases = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['availablePurchasesForCreditNote', supplierId],
    // NOTA: Necesitamos un nuevo método en el servicio de compras para esto.
    // Lo añadiremos en el siguiente paso. Por ahora, asumimos que existe.
    queryFn: () => purchaseService.getAvailableForCreditNote(supplierId),
    enabled: !!supplierId,
  });

  // 3. --- CONFIGURAR LA MUTACIÓN PARA CREAR LA NC ---
  const { mutate: submitCreditNote, isPending: isSaving } = useMutation({
    mutationFn: (data) => creditNoteService.create(data),
    onSuccess: (savedNote) => {
      Notifier.success(`Nota de crédito #${savedNote.documentNumber} registrada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['purchaseCreditNotes'] });
      navigate('/compras/notas-credito');
    },
    onError: (error) => {
      Notifier.showError('Error al Registrar', error.response?.data?.message || 'No se pudo crear la nota de crédito.');
    }
  });

  // 4. --- MANEJADORES DE EVENTOS ---
  //    a) Cuando el usuario selecciona una compra de la tabla
  const handlePurchaseSelect = (purchase) => {
    // Para obtener todos los detalles, necesitamos la compra completa.
    // La tabla solo nos da un resumen, así que hacemos una query para obtener el resto.
    purchaseService.getPurchaseById(purchase.idPurchase).then(fullPurchaseData => {
        setSelectedPurchase(fullPurchaseData);
        // Usamos la función del hook para poblar el formulario.
        updateFormWithPurchaseDetails(fullPurchaseData);
    }).catch(() => Notifier.error("No se pudieron cargar los detalles de la compra seleccionada."));
  };

  //    b) Cuando el usuario cancela la operación
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Cancelar Creación?',
      text: 'Perderás todos los datos ingresados en el formulario.',
      confirmButtonText: 'Sí, cancelar'
    });
    if (result.isConfirmed) {
      navigate('/compras/notas-credito');
    }
  };

  //    c) Cuando el formulario es válido y se envía
  const onFormSubmit = (formData) => {
    const finalDTO = formLogic.prepareSubmitData(formData);
    if (finalDTO) { // prepareSubmitData puede devolver null si hay un error.
        submitCreditNote(finalDTO);
    }
  };

  // 5. --- RENDERIZADO DEL COMPONENTE ---
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Nueva Nota de Crédito sobre Compra</h1>

      {/* La tabla de selección de compras se muestra siempre. */}
      <SelectablePurchasesTable
        purchases={availablePurchases}
        selectedPurchaseId={selectedPurchase?.idPurchase}
        onPurchaseSelect={handlePurchaseSelect}
        isLoading={isLoadingPurchases}
      />

      {/* El formulario solo se muestra cuando se ha seleccionado una compra. */}
      {selectedPurchase && (
        <PurchaseCreditNoteForm
          supplier={supplierData}
          isLoadingSupplier={isLoadingSupplier}
          formLogic={formLogic}
          isSaving={isSaving}
          onSubmit={onFormSubmit}
          onCancel={handleCancel}
          submitButtonText="Registrar Nota de Crédito"
        />
      )}
    </main>
  );
}