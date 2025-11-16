// src/components/accounting/financial-statements/BalanceGeneral.jsx
import React, { useState } from 'react';
import { useAccountingReports } from '../../../hooks/useAccountingReports';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';
import { formatCurrency, formatDate } from '../../../utils/dateFormatter';
import { useCompany } from '../../../context/CompanyContext';
import { Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaSearch } from 'react-icons/fa';
import SubMenu from '../../shared/SubMenu';
import ViewContainer from '../../shared/ViewContainer';
import BalanceGeneralActions from '../../shared/BalanceGeneralActions';
import styles from '../../../styles/accounting/reportsStyles/BalanceGeneral.module.css';

// --- Componentes de Renderizado Internos ---
const Line = ({ code = '', concept, detail = null, total = null, type = '' }) => (
    <div className={`${styles.line} ${styles[type]}`}>
        <span className={styles.code}>{code}</span>
        <span className={styles.concept}>{concept}</span>
        <span className={styles.detail}>{detail !== null ? formatCurrency(detail) : ''}</span>
        <span className={styles.total}>{total !== null ? formatCurrency(total) : ''}</span>
    </div>
);

const CategorySection = ({ title, data }) => (
    <>
        <Line concept={title} type="subcategory" />
        {data.cuentas.map(cuenta => (
            <Line key={cuenta.idCatalog || cuenta.accountName} code={cuenta.accountCode} concept={cuenta.accountName} detail={cuenta.saldoFinal} type="account" />
        ))}
        <Line concept={`TOTAL ${title}`} total={data.subtotal} type="subtotal" />
    </>
);

const BalanceGeneral = () => {
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState({});
  const { data: reportData, isError, error, isFetching } = useAccountingReports('balanceGeneral', filters);
  const { company } = useCompany();
  const hasFilters = !!filters.endDate;

  const handleGenerate = () => {
    if (endDate) setFilters({ endDate });
  };
  
  const handleClear = () => {
    setEndDate('');
    setFilters({});
  };

  return (
    <>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer title="Balance General">
        <div className={styles.filterWrapper}>
            <div className={styles.filterGroup}>
                <label className="form-label fw-bold">Fecha de Corte:</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className={styles.filterActions}>
                <button onClick={handleGenerate} className={styles.actionButton} disabled={!endDate || isFetching}>
                    <FaSearch className="me-2" /> {isFetching ? 'Generando...' : 'Generar'}
                </button>
                <button onClick={handleClear} className={styles.secondaryButton}>
                    Limpiar
                </button>
            </div>
        </div>

        {hasFilters && (
          <div className={styles.reportContainer}>
            {isFetching && <div className="text-center p-5"><Spinner /></div>}
            {isError && <p className="alert alert-danger">Error: {error.message}</p>}
            
            {!isFetching && reportData && (
              <>
                <div className={styles.reportActionsHeader}>
                  <h4 className={styles.resultsTitle}>Resultados del Reporte</h4>
                  <BalanceGeneralActions reportData={reportData} filters={filters} />
                </div>

                <header className={styles.reportHeader}>
                  <h2>{company?.companyName}</h2>
                  <p className="h5">Estado de Situación Financiera</p>
                  <p>Al {formatDate(filters.endDate)}</p>
                </header>
                
                <Line code="Código" concept="Concepto" detail="Detalle" total="Total" type="tableHeader" />
                
                <Line concept="ACTIVO" type="category" />
                <CategorySection title="ACTIVO CORRIENTE" data={reportData.activoCorriente} />
                <CategorySection title="ACTIVO NO CORRIENTE" data={reportData.activoNoCorriente} />
                <Line concept="TOTAL ACTIVO" total={reportData.totalActivos} type="grandTotal" />
                
                <Line concept="PASIVO Y PATRIMONIO" type="category" />
                <CategorySection title="PASIVO CORRIENTE" data={reportData.pasivoCorriente} />
                <CategorySection title="PASIVO NO CORRIENTE" data={reportData.pasivoNoCorriente} />
                <Line concept="TOTAL PASIVO" total={reportData.totalPasivos} type="grandTotal" />

                <CategorySection title="PATRIMONIO" data={reportData.patrimonio} />
                
                <Line concept="TOTAL PASIVO Y PATRIMONIO" total={reportData.totalPasivoYPatrimonio} type="grandTotal" />

                {reportData.balanceCuadrado && (
                    <div className={styles.balanceCheckContainer}>
                        <FaCheckCircle className={styles.balanceCheckIcon} />
                        <strong>Balance Cuadrado</strong>
                    </div>
                )}
              </>
            )}
          </div>
        )}
      </ViewContainer>
    </>
  );
};

export default BalanceGeneral;