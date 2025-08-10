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
    // Determina el tipo y el ID a partir del objeto que se le pasa.
    const type = doc.saleId ? 'venta' :
                 doc.idNotaCredit ? 'nota-credito' :
                 doc.purchaseId ? 'compra' : // Ejemplo para el futuro
                 'desconocido';
    
    const id = doc.saleId || doc.idNotaCredit || doc.purchaseId;
    
    if (type !== 'desconocido') {
      setSelectedDocInfo({ type, id });
      setIsModalOpen(true);
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