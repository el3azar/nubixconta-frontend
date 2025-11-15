// src/components/accounting/financial-statements/BalanceComprobacion.jsx
import React, { useState, useMemo } from 'react';
import { useAccountingReports } from '../../../hooks/useAccountingReports';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';
import { formatCurrency, formatDate } from '../../../utils/dateFormatter';
import { Spinner } from 'react-bootstrap';
import SubMenu from '../../shared/SubMenu';
import ViewContainer from '../../shared/ViewContainer';
import AccountingReportFilter from '../../shared/AccountingReportFilter';
import BalanzaComprobacionActions from '../../shared/BalanzaComprobacionActions';
import styles from '../../../styles/accounting/reportsStyles/BalanzaComprobacion.module.css';

const BalanceComprobacion = () => {
  const [filters, setFilters] = useState({});
  const { data: reportData = [], isError, error, isFetching } = useAccountingReports('balanzaComprobacion', filters);

  const totals = useMemo(() => {
    if (!reportData) return {};
    return reportData.reduce((acc, line) => {
      acc.saldoInicialDeudor += line.saldoInicialDeudor;
      acc.saldoInicialAcreedor += line.saldoInicialAcreedor;
      acc.totalDebePeriodo += line.totalDebePeriodo;
      acc.totalHaberPeriodo += line.totalHaberPeriodo;
      acc.saldoFinalDeudor += line.saldoFinalDeudor;
      acc.saldoFinalAcreedor += line.saldoFinalAcreedor;
      return acc;
    }, {
      saldoInicialDeudor: 0, saldoInicialAcreedor: 0,
      totalDebePeriodo: 0, totalHaberPeriodo: 0,
      saldoFinalDeudor: 0, saldoFinalAcreedor: 0,
    });
  }, [reportData]);

  const hasFilters = filters.startDate && filters.endDate;

  return (
    <>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer title="Balanza de Comprobación">
        <AccountingReportFilter onFilter={setFilters} isLoading={isFetching} />
        
        {hasFilters && (
          <div className={styles.resultsContainer}>
            {isFetching && <div className={styles.loadingOverlay}><Spinner animation="border" /> Generando Reporte...</div>}
            {isError && <p className="alert alert-danger">Error al cargar: {error.message}</p>}
            
            {!isFetching && reportData.length > 0 && (
              <>
                <div className={styles.reportHeader}>
                  <h4 className={styles.reportTitle}>
                    Resultados del Reporte ({formatDate(filters.startDate)} - {formatDate(filters.endDate)})
                  </h4>
                  <BalanzaComprobacionActions reportData={reportData} totals={totals} filters={filters} />
                </div>
                <div className={styles.tableResponsive}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th colSpan="2" rowSpan="2">Cuenta</th>
                        <th colSpan="2">Saldos Iniciales</th>
                        <th colSpan="2">Movimientos del Período</th>
                        <th colSpan="2">Saldos Finales</th>
                      </tr>
                      <tr>
                        <th>Deudor</th>
                        <th>Acreedor</th>
                        <th>Debe</th>
                        <th>Haber</th>
                        <th>Deudor</th>
                        <th>Acreedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(line => (
                        <tr key={line.idCatalog}>
                          <td>{line.accountCode}</td>
                          <td className={styles.alignLeft}>{line.accountName}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.saldoInicialDeudor)}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.saldoInicialAcreedor)}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.totalDebePeriodo)}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.totalHaberPeriodo)}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.saldoFinalDeudor)}</td>
                          <td className={styles.alignRight}>{formatCurrency(line.saldoFinalAcreedor)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className={styles.alignRight}>SUMAS IGUALES</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.saldoInicialDeudor)}</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.saldoInicialAcreedor)}</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.totalDebePeriodo)}</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.totalHaberPeriodo)}</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.saldoFinalDeudor)}</td>
                        <td className={styles.alignRight}>{formatCurrency(totals.saldoFinalAcreedor)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {!isFetching && !isError && reportData.length === 0 && (
              <div className="text-center mt-4 p-5"><p>No se encontraron datos para el período seleccionado.</p></div>
            )}
          </div>
        )}

        {!hasFilters && (
             <div className="text-center mt-5 pt-5"><p>Por favor, seleccione un rango de fechas para generar el reporte.</p></div>
        )}
      </ViewContainer>
    </>
  );
};

export default BalanceComprobacion;