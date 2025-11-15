// src/hooks/useAccountingReports.js
import { useQuery } from '@tanstack/react-query';
import { useReportsService } from '../services/accounting/reportsService';
import { useCompany } from '../context/CompanyContext';

const REPORTS_QUERY_KEY = 'accountingReports';

export const useAccountingReports = (reportType, filters) => {
  // --- INICIO DE LA MODIFICACIÓN ---
  const { getLibroDiario, getLibroMayor, getBalanzaComprobacion, getEstadoResultados } = useReportsService();
  // --- FIN DE LA MODIFICACIÓN ---
  const { company } = useCompany();
  
  const isEnabled = !!company?.id && !!reportType && (
    (reportType === 'libroMayor' && ((!!filters.startDate && !!filters.endDate) || !!filters.catalogId)) ||
    // --- INICIO DE LA MODIFICACIÓN ---
    ((reportType === 'libroDiario' || reportType === 'balanzaComprobacion' || reportType === 'estadoResultados') && (!!filters.startDate && !!filters.endDate))
    // --- FIN DE LA MODIFICACIÓN ---
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
      // --- INICIO DE LA MODIFICACIÓN ---
      if (reportType === 'estadoResultados') {
        return getEstadoResultados(filters.startDate, filters.endDate);
      }
      // --- FIN DE LA MODIFICACIÓN ---
      return Promise.resolve(null);
    },

    enabled: isEnabled,
    keepPreviousData: true, 
  });
};