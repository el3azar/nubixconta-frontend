// src/components/accounting/financial-statements/LibroMayor.jsx
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useAccountingReports } from '../../../hooks/useAccountingReports';
import { useCatalogService } from '../../../services/accounting/CatalogService';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';
import { formatCurrency, formatDateTime, formatDate } from '../../../utils/dateFormatter';
import ViewContainer from '../../shared/ViewContainer';
import SubMenu from '../../shared/SubMenu';
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { Spinner } from 'react-bootstrap';

// --- MODIFICADO: Importamos el nuevo componente de acciones ---
import LibroMayorActions from '../../shared/LibroMayorActions';

import styles from '../../../styles/accounting/reportsStyles/LibroMayor.module.css';

const LibroMayorFilter = ({ onFilter, isLoading }) => {
    // ... (El código del filtro no cambia, se mantiene como en el paso anterior)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const { searchCatalogs } = useCatalogService();

    const loadAccountOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) {
        callback([]);
        return;
        }
        searchCatalogs(inputValue).then(results => {
        const options = results.map(cat => ({
            value: cat.id,
            label: `${cat.accountCode} - ${cat.accountName}`
        }));
        callback(options);
        });
    };

    const handleGenerateReport = () => {
        const filters = {};
        if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
        }
        if (selectedAccount) {
        filters.catalogId = selectedAccount.value;
        }
        onFilter(filters);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedAccount(null);
        onFilter({});
    };

    const canGenerate = (startDate && endDate) || selectedAccount;

    return (
        <div className={styles.filterWrapper}>
        <div className={styles.filterInputsRow}>
            <div className={styles.filterGroup}>
            <label className="form-label fw-bold">Fecha de Inicio:</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
            <label className="form-label fw-bold">Fecha de Fin:</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className={`${styles.filterGroup} ${styles.accountSelector}`}>
            <label className="form-label fw-bold">Filtrar por Cuenta:</label>
            <AsyncSelect
                cacheOptions
                loadOptions={loadAccountOptions}
                defaultOptions
                isClearable
                value={selectedAccount}
                onChange={setSelectedAccount}
                placeholder="Buscar por código o nombre..."
                noOptionsMessage={({ inputValue }) => inputValue.length < 2 ? "Escribe para buscar..." : "No hay coincidencias"}
            />
            </div>
        </div>
        
         <div className={styles.filterActionsRow}>
        <button onClick={handleGenerateReport} className={styles.actionButton} disabled={isLoading || !canGenerate}>
          <FaSearch className="me-2" /> {isLoading ? 'Generando...' : 'Generar Reporte'}
        </button>
        {/* --- CORRECCIÓN CLAVE: Se elimina la clase .actionButton --- */}
        <button onClick={handleClearFilters} className={styles.secondaryButton}>
          Limpiar
        </button>
      </div>
        </div>
    );
};

const AccountAccordion = ({ cuenta }) => {
    // ... (El código del acordeón no cambia)
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.accordionItem}>
        <button className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
            <span className={styles.accountInfo}><strong>{cuenta.accountCode}</strong> - {cuenta.accountName}</span>
            <div className={styles.totals}>
            <span>{formatCurrency(cuenta.totalDebe)}</span>
            <span>{formatCurrency(cuenta.totalHaber)}</span>
            <span className={styles.saldo}>{formatCurrency(cuenta.saldoPeriodo)}</span>
            </div>
            <FaChevronDown className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
        </button>
        {isOpen && (
            <div className={styles.accordionContent}>
            <table className={styles.detailsTable}>
                <thead>
                <tr><th>Fecha</th><th>Documento</th><th>Descripción</th><th className={styles.textRight}>Debe</th><th className={styles.textRight}>Haber</th></tr>
                </thead>
                <tbody>
                {cuenta.movimientos.map((mov, index) => (
                    <tr key={index}><td>{formatDateTime(mov.accountingDate)}</td><td>{mov.documentType} #{mov.documentId}</td><td>{mov.description}</td><td className={styles.textRight}>{formatCurrency(mov.debe)}</td><td className={styles.textRight}>{formatCurrency(mov.haber)}</td></tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
};

const LibroMayor = () => {
  const [filters, setFilters] = useState({});
  const { data: cuentas = [], isError, error, isFetching } = useAccountingReports('libroMayor', filters);
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer title="Libro Mayor">
        <LibroMayorFilter onFilter={setFilters} isLoading={isFetching} />
        
        {hasActiveFilters && (
          <div className={styles.resultsContainer}>
            {isFetching && <div className={styles.loadingOverlay}>Generando Reporte...</div>}
            {isError && <p className="text-danger text-center">Error al cargar: {error.message}</p>}
            
            {!isFetching && cuentas.length > 0 && (
              <>
                <div className={styles.reportHeader}>
                   <h4 className={styles.reportTitle}>
                    Resultados del Reporte
                    {filters.startDate && ` (${formatDate(filters.startDate)} - ${formatDate(filters.endDate)})`}
                  </h4>
                  {/* --- MODIFICADO: Usamos el componente correcto y le pasamos los filtros --- */}
                  <LibroMayorActions reportData={cuentas} filters={filters} />
                </div>

                <div className={styles.accordionHeaderStatic}>
                  <span className={styles.accountInfo}>Cuenta Contable</span>
                  <div className={styles.totals}>
                    <span>Total Debe</span><span>Total Haber</span><span className={styles.saldo}>Saldo Período</span>
                  </div>
                   <div className={styles.arrowPlaceholder}></div>
                </div>
                {cuentas.map((cuenta, index) => (
                  <AccountAccordion key={`${cuenta.idCatalog}-${index}`} cuenta={cuenta} />
                ))}
              </>
            )}
            {!isFetching && cuentas.length === 0 && (
              <div className="text-center mt-4"><p>No se encontraron movimientos para los filtros seleccionados.</p></div>
            )}
          </div>
        )}

        {!hasActiveFilters && (
            <div className="text-center mt-5 pt-5"><p>Por favor, seleccione filtros para generar el reporte.</p></div>
        )}
      </ViewContainer>
    </>
  );
};

export default LibroMayor;