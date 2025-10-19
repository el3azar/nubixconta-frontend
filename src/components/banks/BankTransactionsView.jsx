//imports generales
import React from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { formatDate } from '../../utils/dateFormatter';
//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { DocumentTable } from '../shared/DocumentTable';
import Boton from '../inventory/inventoryelements/Boton';

//Columnas de la tabla de este modulo
export const bankTransactionColumns = [
    { 
        header: 'Correlativo', 
        // Asumiendo que existe una propiedad correlativo en el objeto de la API
        accessor: 'correlative', 
        style: { width: '80px', textAlign: 'center' } 
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
        header: 'Descripción de la transacción', 
        accessor: 'description',
        style: { flexGrow: 1 } 
    },
    { 
        header: 'Monto', 
        accessor: 'amount',
        // Ejemplo de formato de moneda: $1,234.56
        cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
        style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
    },
    // NOTA: La columna 'Acciones' no se define aquí. 
    // Se habilita pasando 'showRowActions={true}' al componente DocumentTable.
];
//columnas de la tabla de otros modulos
export const thisModuleColumns = [
    { header: 'Correlativo', accessor: 'correlative', style: { width: '80px', textAlign: 'center' } },
    { header: 'No. de asiento', accessor: 'seatNumber', style: { width: '100px', textAlign: 'center' } }, // Asumiendo 'seatNumber'
    { header: 'Fecha de transacción', accessor: 'transactionDate', cell: (doc) => formatDate(doc.transactionDate), style: { width: '130px' } },
    { header: 'Modulo de origen', accessor: 'originModule', style: { width: '120px' } }, // Asumiendo 'originModule'
    { header: 'Cuenta bancaria', accessor: 'bankAccountName', style: { width: '150px' } },
    { header: 'No. de referencia', accessor: 'referenceNumber', style: { width: '130px', textAlign: 'center' } },
    { header: 'Descripcion de la transaccion', accessor: 'description', style: { flexGrow: 1 } },
    { header: 'Cargo', accessor: 'debit', cell: (doc) => `$${doc.debit ? doc.debit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, // Asumiendo 'debit'
    { header: 'Abono', accessor: 'credit', cell: (doc) => `$${doc.credit ? doc.credit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, // Asumiendo 'credit'
];
// Recibe las props del selector para buscar la cuenta bancaria y cualquier otra que necesite la vista
const BankTransactionsView = ({ apiDataCodigo }) => {
    // 1. Definición de ESTADOS FALTANTES e internos
    const [codigoValue, setCodigoValue] = React.useState(''); // ESTE ES EL ESTADO FALTANTE
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 2. Estados para la Tabla (Datos, Carga y Error)
    const [transactions, setTransactions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Define el estado inicial para la tabla
    const [activeModule, setActiveModule] = React.useState('ESTE_MODULO');
    
    // Define las columnas y acciones según el módulo activo
    const isEsteModulo = activeModule === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? bankTransactionColumns : thisModuleColumns;
    const showActions = isEsteModulo; // Asumo que 'Otros Modulos' (thisModuleColumns) no tiene acciones aquí.
    // ...


    // 3. Lógica de Búsqueda y API
    // adaptar con condicional if/else si son dos endpoints diferentes para las tablas
    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setTransactions([]); // Limpia la tabla anterior

        try {
            // Aquí iría tu llamada real a la API, usando el estado
            // Ejemplo de endpoint: /api/bancos/transacciones?cuenta=X&inicio=Y&fin=Z
            const response = await fetch(`/api/banco/transacciones?codigo=${codigoValue}&start=${startDate}&end=${endDate}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar las transacciones.');
            }

            const data = await response.json();
            setTransactions(data);

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
    };

    // Placeholder de funciones de acción (NECESARIO si showActions es true para la tabla)
    const actionsProps = {
        onView: (doc) => console.log('Ver transaccion:', doc.correlative),
        onDelete: (doc) => console.log('Anular transaccion:', doc.correlative),
        // Puedes añadir más acciones aquí
    };


    // HANDLERS PARA BOTONES DE ACCIÓN Y ORDENAMIENTO
    const handleNewTransaction = () => {
        // Lógica para navegar a la vista de creación de nueva transacción
        console.log('Navegando a formulario para NUEVA transacción...');
    };
    // Handlers para los botones de la derecha (necesitas implementarlos, trabjan con las tablas de acuerdo a cual esta activa)
    const handleOrderByState = () => console.log('Ordenando por estado...');
    const handleOrderByDate = () => console.log('Ordenando por fecha...');

    //----------------------------------------------------------------------
    // 3. EFECTO PARA RECARGAR DATOS AL CAMBIAR DE MÓDULO O FILTRO
    // ----------------------------------------------------------------------
    React.useEffect(() => {
        // Recarga los datos automáticamente solo si el usuario ya ha seleccionado una cuenta
        if (codigoValue) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModule, codigoValue]); // Activa cuando cambian el módulo o la cuenta seleccionada

    return (
        // Usamos el Fragmento (<> </>) como contenedor raíz
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>
                    Gestión de Transacciones Bancarias
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
            {/* BOTONES DE ACCION PARA LA VISUAIZACION DE TABLAS */}
 {/* Los botones de acción son específicos de esta vista */}
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
                {/* Lado Izquierdo: Botones de filtro por origen */}
                <div className="d-flex gap-2 flex-wrap">
                    <Boton 
                        color={isEsteModulo ? 'morado' : 'blanco'} 
                        forma="pastilla" 
                        onClick={() => setActiveModule('ESTE_MODULO')}
                    >
                        Este Modulo
                    </Boton>
                    <Boton 
                        color={!isEsteModulo ? 'morado' : 'blanco'} 
                        forma="pastilla" 
                        onClick={() => setActiveModule('OTROS_MODULOS')}
                    >
                        Otros Modulos
                    </Boton>
                </div>
        
                {/* Lado Derecho: BOTONES CONDICIONALES */}
                <div className="d-flex gap-2 flex-wrap">
                    {/* 1. Botón NUEVA (Solo en 'Este Modulo') */}
                    {isEsteModulo && (
                        <Boton color="morado" forma="pastilla" onClick={handleNewTransaction}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva
                        </Boton>
                    )}

                    {/* 2. Botón ORDENAR POR ESTADO (Solo en 'Este Modulo') */}
                    {isEsteModulo && (
                        <Boton color="blanco" forma="pastilla" onClick={handleOrderByState}>
                            Ordenar Por Estado
                        </Boton>
                    )}

                    {/* 3. Botón ORDENAR POR FECHA (En AMBOS módulos) */}
                    <Boton color="blanco" forma="pastilla" onClick={handleOrderByDate}>
                        Ordenar Por Fecha
                    </Boton>
                </div>
            </div>
            {/* Componente de Tabla (Usando el genérico DocumentTable) */}
            {/* TABLA: RENDERIZADO DINÁMICO */}
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}> 
                            {/* Columnas dinámicas */}
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                            {/* Encabezado de Acciones Condicional */}
                            {showActions && <th>Acciones</th>} 
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTable
                            documents={transactions}
                            // Columna dinámica
                            columns={currentColumns} 
                            isLoading={isLoading}
                            isError={!!error}
                            error={error}
                            // Habilitación dinámica de Acciones
                            showRowActions={showActions} 
                            actionsProps={actionsProps} 
                            emptyMessage="Utilice el filtro de arriba para buscar transacciones."
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;