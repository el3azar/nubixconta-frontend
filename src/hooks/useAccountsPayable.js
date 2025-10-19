import { useState, useEffect, useCallback } from 'react';
import { Notifier } from '../utils/alertUtils';

// Contexts
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";
import { fetchPayableDetails, fetchPurchaseSummary } from '../services/accountspayable/accountsPayablePurchaseServices';
import { deletePayableDetail } from '../services/accountspayable/deleteByPayableDetails';
import { getPayableDetailById as apiGetDetailById } from '../services/accountspayable/getPayableDetailById';
import { applyPaymentEntry } from '../services/accountspayable/paymentEntryApply';
import { cancelPaymentEntry } from '../services/accountspayable/paymentEntryCancel';
import { getPaymentEntryById } from '../services/accountspayable/getPaymentEntryById';
import { getPayableSortedByDate, getPayableSortedByStatus,  getPayableFilteredByDateRange } from '../services/accountspayable/FilterByDateOrStatus';


// --- Funciones de procesamiento de datos ---


const processPurchaseSummary = (response) => {
    if (!Array.isArray(response)) return [];
    let contador = 1;
    return response.map((item) => {
        const purchase = item.purchase || {};
        const supplierFullName = `${purchase.supplierName || ''} ${purchase.supplierLastName || ''}`.trim();
        return {
            purchaseId: purchase.idPurchase,
            id: purchase.documentNumber || `item-${contador}`,
            correlativo: contador++,
            documento: purchase.documentNumber || 'N/A',
            proveedor: supplierFullName,
            fecha: purchase.issueDate?.substring(0, 10) || '',
            saldo: item.balance ? `$${item.balance.toFixed(2)}` : '$0.00',
            montoTotal: item.payableAmount ? `$${item.payableAmount.toFixed(2)}` : '$0.00',
            diasCredito: purchase.creditDay ?? 0,
            // Agregamos una descripción por defecto si no existe
            descripcion: purchase.purchaseDescription || 'Resumen de venta', 
        };
    });
};

const processPayableDetails = (response) => {
    if (!Array.isArray(response)) return [];
    let contador = 1;
    const transformed = [];

    response.forEach((item) => {
        if (!Array.isArray(item.paymentDetails)) return;
        item.paymentDetails.forEach((detail) => {
            const purchase = item.purchase || {};
            const customerFullName = `${purchase.supplierName|| ''} ${purchase.supplierLastName || ''}`.trim();
            transformed.push({
                id: detail.id,
                correlativo: contador++,
                documento: purchase.documentNumber ?? 'N/A',
                estado: detail.paymentStatus ?? 'N/A',
                proveedor: customerFullName,
                fecha: detail.paymentDetailsDate?.substring(0, 10) ?? '',
                formaPago: detail.paymentMethod ?? 'N/A',
                monto: detail.paymentAmount ? `$${detail.paymentAmount.toFixed(2)}` : '$0.00',
                montoTotal: purchase.totalAmount ? `$${purchase.totalAmount.toFixed(2)}` : '$0.00',
                saldo: item.balance ? `$${item.balance.toFixed(2)}` : '$0.00',
                descripcion: detail.paymentDetailDescription ?? '',
                diasCredito: purchase.creditDay ?? 0,
                color:
                    detail.paymentStatus === 'APLICADO' ? 'green' :
                    detail.paymentStatus === 'ANULADO' ? 'red' : 'neutral',
            });
        });
    });
    return transformed;
};

export const useAccountsPayable = (viewType) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { company } = useCompany();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
       let response;
          // Llama a la API correcta basada en el viewType
          if (viewType === 'summary') {
            response = await fetchPurchaseSummary();
            setData(processPurchaseSummary(response));
          } else { 
            response = await fetchPayableDetails();
            setData(processPayableDetails(response));
            }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [viewType]);



  useEffect(() => {
    fetchData();
  }, [fetchData]);

    const deleteItem = useCallback(async (id) => {
      const result = await Notifier.confirm({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el registro permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        try {
          await deletePayableDetail(id);
          Notifier.success('Cobro eliminado correctamente.');
          fetchData(); // Refresca los datos
        } catch (err) {
          Notifier.error(`Ocurrió un error: ${err.message}`);
        }
      }
    }, [fetchData]);

    const applyItem = useCallback(async (id) => {
        const confirm = await Notifier.confirm({
            title: '¿Deseas aplicar esta partida contable?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                await applyPaymentEntry (id);
                Notifier.success('Partida contable aplicada correctamente.');
                fetchData();
            } catch (error) {
                Notifier.error('Error al aplicar la partida contable.');
            }
        }
    }, [fetchData]);

    const cancelItem = useCallback(async (id) => {
        const confirm = await Notifier.confirm({
            title: '¿Estás seguro?',
            text: 'Esta acción anulará la liquidación contable.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                await cancelPaymentEntry(id);
                Notifier.success('Partida anulada correctamente.');
                fetchData();
            } catch (error) {
                Notifier.error('Error al anular la partida contable.');
            }
        }
    }, [fetchData]);

const getAccountingEntry = useCallback(async (id) => {
        try {
            const entry = await getPaymentEntryById(id);
            // La lógica de formateo se queda aquí, ya que es parte de la lógica de negocio de este dominio
            return {
                accountingEntryId: entry[0]?.id || 'N/A',
                entryDate: entry[0]?.date.substring(0, 10) || 'N/A',
                documentType: entry[0]?.tipo,
                documentNumber: entry[0]?.documentNumber,
                partnerLabel: 'Proveedor',
                partnerName: entry[0]?.supplierName,
                description: entry[0]?.description,
                documentStatus: entry[0]?.status,
                lines: entry.map(line => ({
                    accountCode: line.codAccount,
                    accountName: line.accountName,
                    debit: line.debit,
                    credit: line.credit,
                })),
                totalDebits: entry.reduce((sum, line) => sum + line.debit, 0),
                totalCredits: entry.reduce((sum, line) => sum + line.credit, 0),
                companyName: company?.companyName || 'No disponible',
                username: user?.sub || 'No disponible',
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }, [company, user]);

    const sortByStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortedData = await getPayableSortedByStatus();
      // ¡Aquí está el cambio!
      // Llama a processCollections para aplanar y transformar los datos
      setData(processPayableDetails(sortedData)); 
    } catch (err) {
      setError("No se pudo ordenar por estado.");
    } finally {
      setIsLoading(false);
    }
  };


  const sortByDate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortedData = await getPayableSortedByDate();
      setData(processPayableDetails(sortedData)); 
    } catch (err) {
      setError("No se pudo ordenar por fecha.");
    } finally {
      setIsLoading(false);
    }
  };

const filterByDateRange = async (startDate, endDate) => {
    setIsLoading(true);
    setError(null);
    try {
        const filteredData = await getPayableFilteredByDateRange(startDate, endDate);
        setData(processPayableDetails(filteredData));
    } catch (err) {
        setError("No se pudo filtrar por rango de fechas.");
    } finally {
        setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    actions: {
      refetch: fetchData,
       deleteItem,
       applyItem,
       cancelItem,
       sortByDate,
       sortByStatus,
       getAccountingEntry,
       filterByDateRange,
       getCollectionDetailById: apiGetDetailById,
    },
  };
};