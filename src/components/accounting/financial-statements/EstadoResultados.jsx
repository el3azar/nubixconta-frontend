// src/components/accounting/financial-statements/EstadoResultados.jsx
import React, { useState } from 'react';
import { useAccountingReports } from '../../../hooks/useAccountingReports';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';
import { formatCurrency, formatDate } from '../../../utils/dateFormatter';
import { useCompany } from '../../../context/CompanyContext';
import { Spinner } from 'react-bootstrap';
import SubMenu from '../../shared/SubMenu';
import ViewContainer from '../../shared/ViewContainer';
import AccountingReportFilter from '../../shared/AccountingReportFilter';
import EstadoResultadosActions from '../../shared/EstadoResultadosActions';
import styles from '../../../styles/accounting/reportsStyles/EstadoResultados.module.css';

// Subcomponente para líneas de detalle (cuentas individuales)
const ReportLine = ({ label, amount, isIndented = false }) => (
  <div className={`${styles.line} ${isIndented ? styles.indented : ''}`}>
    <span className={styles.concept}>{label}</span>
    <span className={styles.amountDetail}>{formatCurrency(amount)}</span>
    <span className={styles.amountTotal}></span> {/* Columna vacía a propósito */}
  </div>
);

// Subcomponente para líneas de subtotales y totales
const TotalLine = ({ label, amount, type = 'total' }) => {
  const styleMap = {
    total: styles.total,
    subtotal: styles.subtotal,
    grandTotal: styles.grandTotal,
    finalResult: styles.finalResult
  };
  return (
    <div className={`${styles.line} ${styleMap[type]}`}>
      <span className={styles.concept}>{label}</span>
      <span className={styles.amountDetail}></span> {/* Columna vacía a propósito */}
      <span className={styles.amountTotal}>{formatCurrency(amount)}</span>
    </div>
  );
};

const EstadoResultados = () => {
  const [filters, setFilters] = useState({});
  const { data: reportData, isError, error, isFetching } = useAccountingReports('estadoResultados', filters);
  const { company } = useCompany();
  const hasFilters = filters.startDate && filters.endDate;

  return (
    <>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer title="Estado de Resultados">
        <AccountingReportFilter onFilter={setFilters} isLoading={isFetching} />

        {hasFilters && (
          <div className={styles.resultsContainer}>
            {isFetching && <div className={styles.loadingOverlay}><Spinner animation="border" /></div>}
            {isError && <p className="alert alert-danger">Error: {error.message}</p>}
            
            {!isFetching && reportData && (
              <>
                {/* --- INICIO: Cabecera de Acciones (Botones arriba) --- */}
                <div className={styles.reportActionsHeader}>
                  <h4 className={styles.resultsTitle}>
                    Resultados del Reporte
                  </h4>
                  <EstadoResultadosActions reportData={reportData} filters={filters} />
                </div>
                {/* --- FIN: Cabecera de Acciones --- */}

                <div className={styles.reportBody}>
                  <header className={styles.reportHeader}>
                    <h2 className={styles.companyName}>{company?.companyName}</h2>
                    <p className={styles.reportTitle}>Estado de Resultados</p>
                    <p className={styles.reportPeriod}>Del {formatDate(filters.startDate)} al {formatDate(filters.endDate)}</p>
                  </header>

                  <div className={styles.tableHeader}>
                    <span className={styles.concept}>CONCEPTO</span>
                    <span className={styles.amountDetail}>DETALLE</span>
                    <span className={styles.amountTotal}>TOTAL</span>
                  </div>

                  {/* Ingresos */}
                  <div className={styles.sectionTitle}>Ingresos de Operación</div>
                  {reportData.ingresosOperacionales.map(item => <ReportLine key={item.idCatalog} label={`${item.accountCode} - ${item.accountName}`} amount={item.totalPeriodo} isIndented />)}
                  <TotalLine label="Total Ingresos" amount={reportData.totalIngresosOperacionales} type="grandTotal" />

                  {/* Costos */}
                  <div className={styles.sectionTitle}>(-) Costo de Venta</div>
                  {reportData.costoVenta.map(item => <ReportLine key={item.idCatalog} label={`${item.accountCode} - ${item.accountName}`} amount={-item.totalPeriodo} isIndented />)}
                  <TotalLine label="Total Costo de Venta" amount={-reportData.totalCostoVenta} type="grandTotal" />

                  {/* Utilidad Bruta */}
                  <TotalLine label="= UTILIDAD BRUTA" amount={reportData.utilidadBruta} type="subtotal" />

                  {/* Gastos */}
                  <div className={styles.sectionTitle}>(-) Gastos de Operación</div>
                  {reportData.gastosVenta.map(item => <ReportLine key={item.idCatalog} label={`${item.accountCode} - ${item.accountName}`} amount={-item.totalPeriodo} isIndented />)}
                  {reportData.gastosAdministracion.map(item => <ReportLine key={item.idCatalog} label={`${item.accountCode} - ${item.accountName}`} amount={-item.totalPeriodo} isIndented />)}
                  <TotalLine label="Total Gastos de Operación" amount={-reportData.totalGastosOperacionales} type="grandTotal" />
                  
                  {/* Utilidad Operacional */}
                  <TotalLine label="= UTILIDAD DE OPERACIÓN" amount={reportData.utilidadOperacional} type="subtotal" />

                  {/* Otros */}
                  <TotalLine label="(+) Otros Ingresos" amount={reportData.totalOtrosIngresos} />
                  <TotalLine label="(-) Otros Gastos" amount={-reportData.totalOtrosGastos} />

                  {/* Utilidad antes de Imp. */}
                  <TotalLine label="= UTILIDAD ANTES DE RESERVA E IMPUESTO" amount={reportData.utilidadAntesImpuestos} type="subtotal" />

                  {/* Impuestos y Reserva */}
                  <TotalLine label="(-) Reserva Legal" amount={-reportData.reservaLegal} />
                  <TotalLine label="(-) Impuesto Sobre la Renta" amount={-reportData.impuestoSobreLaRenta} />

                  {/* Resultado Final */}
                  <TotalLine label="= UTILIDAD DEL EJERCICIO" amount={reportData.utilidadDelEjercicio} type="finalResult" />
                </div>
              </>
            )}

            {!isFetching && !isError && !reportData && (
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

export default EstadoResultados;