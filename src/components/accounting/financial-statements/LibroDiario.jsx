// src/components/accounting/financial-statements/LibroDiario.jsx
import React, { useState, useMemo } from 'react';
import { useAccountingReports } from '../../../hooks/useAccountingReports';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';
import { formatCurrency, formatDate } from '../../../utils/dateFormatter';
import ViewContainer from '../../shared/ViewContainer';
import SubMenu from '../../shared/SubMenu';
import AccountingReportFilter from '../../shared/AccountingReportFilter';
import AccountingReportActions from '../../shared/AccountingReportActions';
import styles from '../../../styles/accounting/reportsStyles/LibroDiario.module.css';

const LibroDiario = () => {
  const [filters, setFilters] = useState({});
  const { data: movimientos, isError, error, isFetching } = useAccountingReports('libroDiario', filters);

  const asientosContables = useMemo(() => {
    if (!movimientos) return [];
    
    const grouped = movimientos.reduce((acc, mov) => {
      const uniqueKey = `${mov.documentId}-${mov.documentType}`;
      
      if (!acc[uniqueKey]) {
        acc[uniqueKey] = { 
          id: mov.documentId, 
          type: mov.documentType, 
          date: mov.accountingDate, 
          details: [] 
        };
      }
      
      acc[uniqueKey].details.push(mov);
      return acc;
    }, {});

    // Después de agrupar, iteramos sobre cada asiento para ordenar sus detalles.
    Object.values(grouped).forEach(asiento => {
        asiento.details.sort((a, b) => b.debe - a.debe);
    });
    
    return Object.values(grouped);
  }, [movimientos]);

  return (
    <>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer title="Libro Diario">
        <AccountingReportFilter onFilter={setFilters} isLoading={isFetching} />

        {filters.startDate && (
          <div>
            {asientosContables.length > 0 && (
              <>
                <h3 className={styles.reportSectionTitle}>Resultados del Reporte</h3>
                <div className="mb-4">
                  <AccountingReportActions reportData={movimientos} />
                </div>
              </>
            )}

            <div className={styles.resultsContainer}>
              {isFetching && <div className={styles.loadingOverlay}>Generando Reporte...</div>}
              {isError && <p className="text-danger text-center">Error al cargar: {error.message}</p>}
              
              {!isFetching && asientosContables.length === 0 && (
                <div className="text-center mt-4">
                  <p>No se encontraron asientos contables para el período seleccionado.</p>
                </div>
              )}

              {!isFetching && asientosContables.map(asiento => (
                <div key={`${asiento.id}-${asiento.type}`} className={styles.asientoWrapper}>
                  <div className={styles.asientoHeader}>
                    <h4>Asiento Contable #{asiento.id}</h4>
                    <span>{asiento.type} - {formatDate(asiento.date)}</span>
                  </div>
                  <div className={styles.tableResponsive}>
                    <table className={styles.reportTable}>
                      <thead>
                        {/* --- CAMBIO 1: SE AÑADE LA COLUMNA "NOMBRE DE CUENTA" Y SE AJUSTA LA DE DESCRIPCIÓN --- */}
                        <tr>
                          <th>Cod. Cuenta</th>
                          <th>Nombre de Cuenta</th>
                          <th>Descripción</th>
                          <th className={styles.textRight}>Debe</th>
                          <th className={styles.textRight}>Haber</th>
                        </tr>
                        {/* --- FIN DEL CAMBIO 1 --- */}
                      </thead>
                      <tbody>
                        {asiento.details.map((mov, index) => (
                          <tr key={index} className={styles.detailRow}>
                            {/* --- CAMBIO 2: SE UTILIZAN LOS NUEVOS CAMPOS DEL BACKEND --- */}
                            <td>{mov.accountCode}</td>
                            <td>{mov.accountName}</td>
                            <td>{mov.description}</td>
                            <td className={styles.textRight}>{formatCurrency(mov.debe)}</td>
                            <td className={styles.textRight}>{formatCurrency(mov.haber)}</td>
                            {/* --- FIN DEL CAMBIO 2 --- */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!filters.startDate && (
             <div className="text-center mt-5 pt-5">
              <p>Por favor, seleccione un rango de fechas para generar el reporte.</p>
            </div>
        )}
      </ViewContainer>
    </>
  );
};

export default LibroDiario;