//imports generales
import React, {useState, useMemo } from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { Notifier } from '../../utils/alertUtils';
import { formatDate } from '../../utils/dateFormatter'; // Importar formatDate
//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import Boton from '../inventory/inventoryelements/Boton';
import { DocumentTable } from '../shared/DocumentTable'; // IMPORTAR DocumentTable

// Definición de columnas para BankReportsView
export const thisModuleReportColumns = [
    { 
        header: 'Correlativo', 
        accessor: 'correlative', 
        style: { width: '80px', textAlign: 'center' } 
    },
    { 
        header: 'Nombre de cuenta bancaria', 
        accessor: 'bankAccountName', // Asumiendo que el campo es 'bankAccountName'
        style: { width: '150px' }
    },
    { 
        header: 'Fecha de transacción', 
        accessor: 'transactionDate',
        cell: (doc) => formatDate(doc.transactionDate), // Asegúrate de tener formatDate importado
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
    // No se incluye la columna 'Acciones' porque es un reporte (solo lectura).
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
    // 1. Definición de ESTADOS FALTANTES e internos
    const [codigoValue, setCodigoValue] = React.useState(''); // ESTE ES EL ESTADO FALTANTE
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    // ...
    // --- 2. ¡NUEVO! Estado para el filtro de tipo de origen (Manual/Automático) ---
    const [originFilter, setOriginFilter] = useState(null); // null = Todos, 'Manual', 'Automatico'
    // El estado para la vista: Usaremos 'ESTE_MODULO' como valor por defecto
    const [activeReportMode, setActiveReportMode] = useState('ESTE_MODULO');
    // --- NUEVOS ESTADOS para la Tabla ---
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // LÓGICA DE CONTROL DE VISTA
    const isEsteModulo = activeReportMode === 'ESTE_MODULO';
    
    // Seleccionar las columnas dinámicamente
    const currentColumns = isEsteModulo ? thisModuleReportColumns : otherModulesReportColumns;



    // --- LÓGICA DE BÚSQUEDA ---
    const handleSearch = async () => {        
        setIsLoading(true);
        setError(null);
        setReportData([]); // Limpiar datos previos
        
        try {
            // Ejemplo de llamada a la API con todos los filtros
            // hacer que sea condicional si las apis son distintas para la tabla
            const query = new URLSearchParams({
                codigo: codigoValue,
                start: startDate,
                end: endDate,
                origin: originFilter || ''
            }).toString();
            
            // Simulación de llamada a API
            // const response = await fetch(`/api/reports/bank?${query}`);
            // if (!response.ok) throw new Error('Error al generar el reporte.');
            // const data = await response.json();
            
            // Reemplaza con datos mock para que la tabla se vea llena
            const data = [
                { correlative: '1A', bankAccountName: 'Banco 1', transactionDate: '2023-01-01', referenceNumber: '0085324', description: 'desc 1', amount: 1500.00, origin: 'Automático' },
                { correlative: '1B', bankAccountName: 'Banco 2', transactionDate: '2023-01-02', referenceNumber: '0853679', description: 'desc 2', amount: 450.50, origin: 'Manual' },
                { correlative: '1C', bankAccountName: 'Banco 3', transactionDate: '2023-01-03', referenceNumber: '0008765', description: 'desc 3', amount: 120.99, origin: 'Automático' },
            ];
            
            setReportData(data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCodigoValue(''); // Usamos el setter interno
        setStartDate('');
        setEndDate('');
        setOriginFilter(null);
        setReportData([]); // Limpia la tabla, cuidado con este
    };

    // La función que maneja el cambio de módulo y dispara la búsqueda si ya hay filtros.
    const handleModuleChange = (moduleKey) => {
        setActiveReportMode(moduleKey);
        // Opcional: Si deseas que la tabla se recargue automáticamente al cambiar de módulo, 
        // puedes llamar a handleSearch() aquí o usar un useEffect como en el componente anterior.
    };

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
                onCodigoChange={setCodigoValue} // Pasa el setter directamente
                startDate={startDate}
                onStartDateChange={setStartDate} // Pasa el setter
                endDate={endDate}
                onEndDateChange={setEndDate} // Pasa el setter
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
             {/* Los botones de acción son específicos de esta vista */}
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
                <Boton color="morado" forma="pastilla" onClick="submit">
                Generar Reporte en PDF
                <BsFileEarmarkPdf size={19} className='ms-2'/>
                </Boton>
                <Boton color="morado" forma="pastilla" onClick="submit">
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
                            showRowActions={false} // No se muestran acciones
                            emptyMessage="Presione 'Buscar' para generar el reporte de transacciones."
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankReportsView;