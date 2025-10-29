//imports generales
import React, {useState, useMemo, useEffect } from 'react'; // Agregué useEffect
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { Notifier } from '../../utils/alertUtils';
import { formatDate } from '../../utils/dateFormatter';
//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import Boton from '../inventory/inventoryelements/Boton';
import { DocumentTable } from '../shared/DocumentTable';

// =========================================================================
// DATOS QUEMADOS (MOCK DATA)
// =========================================================================

// Mock para 'Este Modulo' (thisModuleReportColumns)
const mockEsteModuloReportData = [
    { correlative: '1001', bankAccountName: 'Ahorro BNC', transactionDate: '2023-10-01T00:00:00Z', referenceNumber: 'REF-M-1', description: 'Depósito Manual de Cliente A', amount: 1500.00 },
    { correlative: '1002', bankAccountName: 'Corriente BanCo', transactionDate: '2023-10-05T00:00:00Z', referenceNumber: 'REF-M-2', description: 'Pago de Cheque manual a Proveedor Z', amount: -450.50 },
    { correlative: '1003', bankAccountName: 'Ahorro BNC', transactionDate: '2023-10-10T00:00:00Z', referenceNumber: 'REF-M-3', description: 'Transferencia electrónica manual', amount: -1200.99 },
];

// Mock para 'Otros Módulos' (otherModulesReportColumns)
const mockOtrosModulosReportData = [
    { correlative: '2001', seatNumber: 'ASN-001', transactionDate: '2023-10-02T00:00:00Z', originModule: 'Inventario', bankAccountName: 'Corriente BanCo', referenceNumber: 'INV-F45', description: 'Pago automático de factura de inventario', debit: 0.00, credit: 800.00 },
    { correlative: '2002', seatNumber: 'ASN-002', transactionDate: '2023-10-06T00:00:00Z', originModule: 'Ventas', bankAccountName: 'Ahorro BNC', referenceNumber: 'VNT-R87', description: 'Ingreso por cobro de venta', debit: 1500.75, credit: 0.00 },
    { correlative: '2003', seatNumber: 'ASN-003', transactionDate: '2023-10-11T00:00:00Z', originModule: 'Contabilidad', bankAccountName: 'Corriente BanCo', referenceNumber: 'CTA-C99', description: 'Ajuste contable de saldo bancario', debit: 0.00, credit: 50.00 },
];


// Definición de columnas (Se mantienen igual)
export const thisModuleReportColumns = [
    { 
        header: 'Correlativo', 
        accessor: 'correlative', 
        style: { width: '80px', textAlign: 'center' } 
    },
    { 
        header: 'Nombre de cuenta bancaria', 
        accessor: 'bankAccountName',
        style: { width: '150px' }
    },
    { 
        header: 'Fecha de transacción', 
        accessor: 'transactionDate',
        cell: (doc) => formatDate(doc.transactionDate), 
        style: { width: '130px' } 
    },
    { 
        header: 'No. de referencia', 
        accessor: 'referenceNumber', 
        style: { width: '130px', textAlign: 'center' } 
    },
    { 
        header: 'Descripción de la transaccion', 
        accessor: 'description',
        style: { flexGrow: 1 } 
    },
    { 
        header: 'Monto', 
        accessor: 'amount',
        cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
        style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
    },
];

export const otherModulesReportColumns = [
    { header: 'Correlativo', accessor: 'correlative', style: { width: '80px', textAlign: 'center' } },
    { header: 'No. de asiento', accessor: 'seatNumber', style: { width: '100px', textAlign: 'center' } },
    { header: 'Fecha de transacción', accessor: 'transactionDate', cell: (doc) => formatDate(doc.transactionDate), style: { width: '130px' } },
    { header: 'Modulo de origen', accessor: 'originModule', style: { width: '120px' } }, 
    { header: 'Cuenta bancaria', accessor: 'bankAccountName', style: { width: '150px' } },
    { header: 'No. de referencia', accessor: 'referenceNumber', style: { width: '130px', textAlign: 'center' } },
    { header: 'Descripcion de la transaccion', accessor: 'description', style: { flexGrow: 1 } },
    { header: 'Cargo', accessor: 'debit', cell: (doc) => `$${doc.debit ? doc.debit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, 
    { header: 'Abono', accessor: 'credit', cell: (doc) => `$${doc.credit ? doc.credit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, 
];

// Recibe las props del selector para buscar la cuenta bancaria y cualquier otra que necesite la vista
const BankReportsView = ({ apiDataCodigo }) => {
    // 1. Definición de ESTADOS
    const [codigoValue, setCodigoValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [originFilter, setOriginFilter] = useState(null); 
    
    // ESTADO INICIAL CON DATOS QUEMADOS para 'Este Módulo'
    const [activeReportMode, setActiveReportMode] = useState('ESTE_MODULO');
    const [reportData, setReportData] = useState(mockEsteModuloReportData); // Inicializar con mock
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // LÓGICA DE CONTROL DE VISTA
    const isEsteModulo = activeReportMode === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? thisModuleReportColumns : otherModulesReportColumns;


    // --- LÓGICA DE BÚSQUEDA ---
    // ... (Dentro del componente BankReportsView)

    const handleSearch = async () => {        
        setIsLoading(true);
        setError(null);
        setReportData([]); // Limpiar datos previos
        
        // 1. Determinar el Endpoint y la estructura de datos
        const endpointBase = isEsteModulo 
            ? `/api/reports/banco/este-modulo`     // Ejemplo de API para Este Módulo
            : `/api/reports/banco/otros-modulos`; // Ejemplo de API para Otros Módulos
        
        // 2. Construir los parámetros de la consulta (query string)
        // Se incluyen los valores de los filtros (cuenta, fechas)
        const query = new URLSearchParams({
            codigo: codigoValue,
            start: startDate,
            end: endDate,
            origin: originFilter || ''
        }).toString();
        
        const url = `${endpointBase}?${query}`;
        
        try {
            // 3. Realizar la llamada real a la API
            const response = await fetch(url);

            if (!response.ok) {
                // Manejar errores de respuesta HTTP (ej: 404, 500)
                throw new Error(`Error ${response.status}: No se pudo generar el reporte.`);
            }

            const data = await response.json(); // La respuesta debe ser un array de documentos/transacciones
            
            // 4. Actualizar el estado con los datos reales
            setReportData(data);
            
            // **OPCIONAL:** CÓDIGO DE SIMULACIÓN DE MOCK DATA
            /*
            // Simulación: Esperar 500ms y cargar el mock correspondiente
            await new Promise(resolve => setTimeout(resolve, 500));
            const dataToLoad = isEsteModulo ? mockEsteModuloReportData : mockOtrosModulosReportData;
            setReportData(dataToLoad);
            */

        } catch (err) {
            console.error("Error en la búsqueda del reporte:", err);
            setError(err);
            // Opcionalmente, puedes cargar el mock data aquí si la API falla
            // setReportData(isEsteModulo ? mockEsteModuloReportData : mockOtrosModulosReportData);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCodigoValue('');
        setStartDate('');
        setEndDate('');
        setOriginFilter(null);
        setReportData([]); // Limpia la tabla
    };

    // La función que maneja el cambio de módulo y dispara la carga de mocks.
    const handleModuleChange = (moduleKey) => {
        setActiveReportMode(moduleKey);
        // Cuando cambia el módulo, cargamos inmediatamente el mock correspondiente
        const dataToLoad = moduleKey === 'ESTE_MODULO' ? mockEsteModuloReportData : mockOtrosModulosReportData;
        setReportData(dataToLoad);
    };

    // Efecto para cargar los datos iniciales si la tabla comienza vacía (opcional)
    /*
    useEffect(() => {
        if (reportData.length === 0 && !codigoValue) {
            setReportData(mockEsteModuloReportData);
        }
    }, []);
    */

    return (
        // Usamos el Fragmento (<> </>) como contenedor raíz
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>
                    Generación de Reportes Bancarios
                </h2>
            </div>
            
            <SearchCardBank
                apiDataCodigo={apiDataCodigo}
                codigoValue={codigoValue}
                onCodigoChange={setCodigoValue}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            {/* BOTONES DE ACCIÓN PARA LA VISUALIZACIÓN DE TABLAS */}
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
            {/* Lado Izquierdo: Botones de filtro por origen */}
            <div className="d-flex gap-2 flex-wrap mb-2 mb-md-0">
                <Boton 
                    color={isEsteModulo ? 'morado' : 'blanco'} 
                    forma="pastilla" 
                    onClick={() => handleModuleChange('ESTE_MODULO')}
                >
                    Este Modulo
                </Boton>
                <Boton 
                    color={!isEsteModulo ? 'morado' : 'blanco'} 
                    forma="pastilla" 
                    onClick={() => handleModuleChange('OTROS_MODULOS')}
                >
                    Otros Modulos
                </Boton>
            </div>
    
            {/* Lado Derecho: Botones de generación de reportes */}
            <div className="d-flex gap-2 flex-wrap">
                <Boton color="morado" forma="pastilla" onClick={() => console.log('Generar PDF', reportData)}>
                Generar Reporte en PDF
                <BsFileEarmarkPdf size={19} className='ms-2'/>
                </Boton>
                <Boton color="morado" forma="pastilla" onClick={() => console.log('Generar Excel', reportData)}>
                Generar Reporte en Excel
                <BsFileEarmarkExcel size={19} className='ms-2'/>
                </Boton>
            </div>
            </div>
            {/* INTEGRACIÓN DE LA TABLA DE REPORTE (DINÁMICA) */}
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}> 
                            {/* Columnas dinámicas */}
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTable
                            documents={reportData} 
                            columns={currentColumns} // Columnas dinámicas
                            isLoading={isLoading}
                            isError={!!error}
                            error={error}
                            showRowActions={false} // No se muestran acciones para reportes
                            emptyMessage="Presione 'Buscar' para generar el reporte de transacciones."
                            styles={styles} // Importante para la alineación CSS
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankReportsView;