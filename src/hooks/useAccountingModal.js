import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '../context/CompanyContext';
import { AccountingService } from '../services/accounting/AccountingService';

export const useAccountingModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocInfo, setSelectedDocInfo] = useState(null);
  const { company } = useCompany();
  const { getAccountingEntry } = AccountingService();

  // La query para buscar los datos del asiento.
  const queryResult = useQuery({
    queryKey: ['accountingEntry', selectedDocInfo?.type, selectedDocInfo?.id],
    queryFn: () => getAccountingEntry(selectedDocInfo.type, selectedDocInfo.id),
    enabled: !!selectedDocInfo,
    staleTime: Infinity,
  });

  // Función que otros componentes llamarán para ABRIR el modal.
 const openAccountingModal = (doc) => {
    console.log("Documento recibido para asiento contable:", doc);
    
    // --- INICIO DE LA CORRECCIÓN: Lógica de detección mejorada ---
    let type = 'desconocido';
    let id = null;

    if (doc.saleStatus) {
      type = 'venta';
      id = doc.saleId;
    } else if (doc.purchaseStatus) {
      type = 'compra';
      id = doc.idPurchase;
    } else if (doc.creditNoteStatus && doc.sale) {
      type = 'nota-credito';
      id = doc.idNotaCredit;
    } else if (doc.creditNoteStatus && doc.purchase) {
      // Esta es la nueva condición que identifica nuestro documento.
      type = 'nota-credito-compra';
      id = doc.idPurchaseCreditNote; // Usamos el ID correcto.
    }else if (doc.incomeTaxStatus) {
      type = 'retencion-isr';
      id = doc.idIncomeTax;
    }
    // --- FIN DE LA CORRECCIÓN ---

    console.log(`Documento identificado como tipo: ${type}, ID: ${id}`);
    
    if (type !== 'desconocido' && id) {
      setSelectedDocInfo({ type, id });
      setIsModalOpen(true);
    } else {
      console.error("No se pudo determinar el tipo de documento para el asiento contable.", doc);
    }
  };


  // Función para CERRAR el modal.
  const closeAccountingModal = () => {
    setIsModalOpen(false);
    setSelectedDocInfo(null);
  };

  // El hook devuelve todo lo que un componente necesita para usar el modal.
  return {
    isModalOpen,
    openAccountingModal,
    closeAccountingModal,
    modalData: queryResult.data,
    isModalLoading: queryResult.isLoading,
    isModalError: queryResult.isError,
    modalError: queryResult.error,
  };
};