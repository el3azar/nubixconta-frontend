import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Notifier } from '../utils/alertUtils';

// Contexts
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";

// Services (con las rutas de importación correctas)
import { 
    fetchCollections,fetchSalesSummary, 
   // fetchAccountsByDate as apiFetchByDate 
} from '../services/accountsReceivableServices';
import { getCollectionDetailById as apiGetDetailById } from '../services/accountsreceivable/getCollectionDetailById';
import { getCollectionEntryById as apiGetEntryById } from '../services/accountsreceivable/getCollectionEntryById';
import { deleteCollectionDetail as apiDeleteDetail } from '../services/accountsreceivable/deleteByCollectionDetails';
import { applyCollectionEntry as apiApplyEntry } from '../services/accountsreceivable/collectionEntryApply';
import { cancelCollectionEntry as apiCancelEntry } from '../services/accountsreceivable/collectionEntryCancel';
import { getReceivablesSortedByDate, getReceivablesSortedByStatus } from '../services/accountsreceivable/FilterByDateOrStatus';

// --- Funciones de procesamiento de datos ---

const processCollections = (response) => {
    if (!Array.isArray(response)) return [];
    let contador = 1;
    const transformed = [];

    response.forEach((item) => {
        if (!Array.isArray(item.collectionDetails)) return;
        item.collectionDetails.forEach((detail) => {
            const sale = item.sale || {};
            const customerFullName = `${sale.customerName || ''} ${sale.customerLastName || ''}`.trim();
            transformed.push({
                id: detail.id,
                correlativo: contador++,
                documento: sale.documentNumber ?? 'N/A',
                estado: detail.paymentStatus ?? 'N/A',
                cliente: customerFullName,
                fecha: detail.collectionDetailDate?.substring(0, 10) ?? '',
                formaPago: detail.paymentMethod ?? 'N/A',
                monto: detail.paymentAmount ? `$${detail.paymentAmount.toFixed(2)}` : '$0.00',
                montoTotal: sale.totalAmount ? `$${sale.totalAmount.toFixed(2)}` : '$0.00',
                saldo: item.balance ? `$${item.balance.toFixed(2)}` : '$0.00',
                descripcion: detail.paymentDetailDescription ?? '',
                diasCredito: sale.creditDay ?? 0,
                color:
                    detail.paymentStatus === 'APLICADO' ? 'green' :
                    detail.paymentStatus === 'ANULADO' ? 'red' : 'neutral',
            });
        });
    });
    return transformed;
};

const processSalesSummary = (response) => {
    if (!Array.isArray(response)) return [];
    let contador = 1;
    return response.map((item) => {
        const sale = item.sale || {};
        const customerFullName = `${sale.customerName || ''} ${sale.customerLastName || ''}`.trim();
        return {
            saleId: sale.saleId,
            id: sale.documentNumber || `item-${contador}`,
            correlativo: contador++,
            documento: sale.documentNumber || 'N/A',
            cliente: customerFullName,
            fecha: sale.issueDate?.substring(0, 10) || '',
            saldo: item.balance ? `$${item.balance.toFixed(2)}` : '$0.00',
            montoTotal: sale.totalAmount ? `$${sale.totalAmount.toFixed(2)}` : '$0.00',
            diasCredito: sale.creditDay ?? 0,
            // Agregamos una descripción por defecto si no existe
            descripcion: item.description || 'Resumen de venta', 
        };
    });
};

export const useAccountsReceivable = (viewType) => {
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
            response = await fetchSalesSummary();
            setData(processSalesSummary(response));
          } else { // 'collections' o cualquier otro valor
            response = await fetchCollections();
            setData(processCollections(response));
            }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [viewType]);

    const sortByStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortedData = await getReceivablesSortedByStatus();
      // ¡Aquí está el cambio!
      // Llama a processCollections para aplanar y transformar los datos
      setData(processCollections(sortedData)); 
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
      const sortedData = await getReceivablesSortedByDate();
      // ¡Aquí está el cambio!
      // Llama a processCollections para aplanar y transformar los datos
      setData(processCollections(sortedData)); 
    } catch (err) {
      setError("No se pudo ordenar por fecha.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchByDate = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      Notifier.warning('Por favor selecciona un rango de fechas válido.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetchByDate(startDate,endDate);
      setData(processApiResponse(response));

    } catch (err) {
      if (err.response && err.response.status === 400) {
         setError('El formato de fecha es inválido. Por favor, inténtalo de nuevo.');
         Notifier.error('Error en el formato de las fechas.');
      } else {
         setError(err.message);
         Notifier.error('Error al filtrar por fechas.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiDeleteDetail(id);
        Notifier.success('Cobro eliminado correctamente.');
        fetchData(); // Refresca los datos
      } catch (err) {
        Notifier.error(`Ocurrió un error: ${err.message}`);
      }
    }
  }, [fetchData]);

    const applyItem = useCallback(async (id) => {
        const confirm = await Swal.fire({
            title: '¿Deseas aplicar esta partida contable?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                await apiApplyEntry(id);
                Notifier.success('Partida contable aplicada correctamente.');
                fetchData();
            } catch (error) {
                Notifier.error('Error al aplicar la partida contable.');
            }
        }
    }, [fetchData]);


    const cancelItem = useCallback(async (id) => {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción anulará la liquidación contable.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                await apiCancelEntry(id);
                Notifier.success('Partida anulada correctamente.');
                fetchData();
            } catch (error) {
                Notifier.error('Error al anular la partida contable.');
            }
        }
    }, [fetchData]);

    // Lógica para el modal de asiento contable
    const getAccountingEntry = useCallback(async (id) => {
        try {
            const entry = await apiGetEntryById(id);
            // La lógica de formateo se queda aquí, ya que es parte de la lógica de negocio de este dominio
            return {
                accountingEntryId: entry[0]?.id || 'N/A',
                entryDate: entry[0]?.date.substring(0, 10) || 'N/A',
                documentType: entry[0]?.tipo,
                documentNumber: entry[0]?.documentNumber,
                partnerLabel: 'Cliente',
                partnerName: entry[0]?.custumerName,
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


  return {
    data,
    isLoading,
    error,
    actions: {
      searchByDate,
      deleteItem,
      applyItem,
      cancelItem,
      sortByDate,
      sortByStatus,
      refetch: fetchData,
      getCollectionDetailById: apiGetDetailById, // Exponemos la función directamente
      getAccountingEntry,
    },
  };
};