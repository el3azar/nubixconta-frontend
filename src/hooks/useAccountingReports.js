// src/hooks/useAccountingReports.js
import { useQuery } from '@tanstack/react-query';
import { useReportsService } from '../services/accounting/reportsService';
import { useCompany } from '../context/CompanyContext';

const REPORTS_QUERY_KEY = 'accountingReports';

export const useAccountingReports = (reportType, filters) => {
  // --- INICIO DE LA CORRECCIÓN ---
  // Añadimos getBalanceGeneral a la desestructuración.
  const { 
    getLibroDiario, 
    getLibroMayor, 
    getBalanzaComprobacion, 
    getEstadoResultados, 
    getBalanceGeneral 
  } = useReportsService();
  // --- FIN DE LA CORRECCIÓN ---

  const { company } = useCompany();
  
  const isEnabled = !!company?.id && !!reportType && (
    (reportType === 'libroMayor' && ((!!filters.startDate && !!filters.endDate) || !!filters.catalogId)) ||
    (
      ['libroDiario', 'balanzaComprobacion', 'estadoResultados'].includes(reportType) && 
      (!!filters.startDate && !!filters.endDate)
    ) ||
    (reportType === 'balanceGeneral' && !!filters.endDate)
  );

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, reportType, company?.id, filters],
    
    queryFn: () => {
      if (reportType === 'libroDiario') {
        return getLibroDiario(filters.startDate, filters.endDate);
      }
      if (reportType === 'libroMayor') {
        return getLibroMayor(filters);
      }
      if (reportType === 'balanzaComprobacion') {
        return getBalanzaComprobacion(filters.startDate, filters.endDate);
      }
      if (reportType === 'estadoResultados') {
        return getEstadoResultados(filters.startDate, filters.endDate);
      }
      if (reportType === 'balanceGeneral') {
        // Ahora esta función sí está definida en este scope.
        return getBalanceGeneral(filters.endDate);
      }
      return Promise.resolve(null);
    },

    enabled: isEnabled,
    keepPreviousData: true, 
  });
};