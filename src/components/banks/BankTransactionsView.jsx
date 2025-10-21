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
import { useNavigate } from "react-router-dom";

// Datos de prueba (QUEMADOS) para la tabla 'Este Módulo' (borrar luego)
const mockBankTransactions = [
    {
        id: 'BTR-001',
        correlative: 1001,
        transactionDate: '2025-10-18T00:00:00Z',
        referenceNumber: 'REF-BANK-54321',
        description: 'Pago a Proveedor A por mercadería',
        amount: 4500.50,
        status: 'PENDIENTE' // Estado para probar la lógica de acciones
    },
    {
        id: 'BTR-002',
        correlative: 1002,
        transactionDate: '2025-10-19T00:00:00Z',
        referenceNumber: 'REF-BANK-54322',
        description: 'Depósito de Cliente Z',
        amount: 875.25,
        status: 'APLICADA' // Estado para probar la lógica de acciones
    },
];
// Datos de prueba (QUEMADOS) para la tabla 'Otros Módulos'
const mockOtherModuleTransactions = [
    {
        id: 'OMT-001',
        correlative: 2001,
        seatNumber: 'ASN-0123',
        transactionDate: '2025-10-15T00:00:00Z',
        originModule: 'Inventario',
        bankAccountName: 'Cuenta Corriente BAC',
        referenceNumber: 'INV-45678',
        description: 'Pago de factura de compra',
        debit: 1200.00,
        credit: 0.00,
    },
    {
        id: 'OMT-002',
        correlative: 2002,
        seatNumber: 'ASN-0124',
        transactionDate: '2025-10-16T00:00:00Z',
        originModule: 'Ventas',
        bankAccountName: 'Cuenta Ahorro Banco X',
        referenceNumber: 'VNT-90123',
        description: 'Cobro de venta de servicios',
        debit: 0.00,
        credit: 350.75,
    },
];

//columnas de la tabla de otros modulos (SIN acciones)
export const thisModuleColumns = [
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
const BankTransactionsView = ({ apiDataCodigo }) => {
    // 1. Definición de ESTADOS FALTANTES e internos
    const [codigoValue, setCodigoValue] = React.useState(''); 
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 2. Estados para la Tabla (Datos, Carga y Error)
    const [transactions, setTransactions] = React.useState(mockBankTransactions);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Define el estado inicial para la tabla
    const [activeModule, setActiveModule] = React.useState('ESTE_MODULO');
    
    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();

    // 2. Definir funciones (handlers) para la navegación y acciones
    const handleNew = () => {
        navigate('/bancos/nueva'); 
    };
    
    const handleEdit = (doc) => {
        console.log("Editar:", doc.id);
        navigate('/bancos/editar');
    };
    
    const handleView = (doc) => {
        console.log("Ver:", doc.id);
        navigate('/bancos/ver'); 
    };

    const handleDelete = (doc) => {
        if (window.confirm(`¿Está seguro de eliminar la transacción "${doc.referenceNumber}"?`)) {
            console.log("Eliminar:", doc.id);
            // Aquí iría tu lógica de eliminación
            setTransactions(prev => prev.filter(item => item.id !== doc.id));
        }
    };
    
    const handleApprove = (doc) => {
        if (window.confirm(`¿Está seguro de aplicar la transacción "${doc.referenceNumber}"?`)) {
            console.log("Aprobar:", doc.id);
            // Aquí iría tu lógica de aplicación
            setTransactions(prev => prev.map(item => 
                item.id === doc.id ? { ...item, status: 'APLICADA' } : item
            ));
        }
    };
    
    const handleCancel = (doc) => {
        if (window.confirm(`¿Está seguro de anular la transacción "${doc.referenceNumber}"?`)) {
            console.log("Anular:", doc.id);
            // Aquí iría tu lógica de anulación
            setTransactions(prev => prev.map(item => 
                item.id === doc.id ? { ...item, status: 'ANULADA' } : item
            ));
        }
    };

    // Columnas de la tabla de este modulo (CON columna de acciones condicional)
    const bankTransactionColumns = [
        { 
            header: 'Correlativo', 
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
            header: 'Estado',
            accessor: 'status', 
            style: { width: '100px', textAlign: 'center' } 
        },
        { 
            header: 'Monto', 
            accessor: 'amount',
            cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
            style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
        },
        // COLUMNA DE ACCIONES con lógica condicional basada en el estado
        {
            header: 'Acciones',
            accessor: 'actions',
            style: { width: '180px', textAlign: 'center' },
            cell: (doc) => {
                // Lógica condicional basada en el estado
                if (doc.status === 'PENDIENTE') {
                    return (
                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <Boton color="blanco" title="Ver Detalles" size="icon" forma="pastilla" onClick={() => handleView(doc)}>
                                <i className="bi bi-eye"></i>
                            </Boton>
                            <Boton color="rojo" title="Eliminar" size="icon" forma="pastilla" onClick={() => handleDelete(doc)}>
                                <i className="bi bi-trash"></i>
                            </Boton>
                            <Boton color="verde" title="Aplicar" size="icon" forma="pastilla" onClick={() => handleApprove(doc)}>
                                <i className="bi bi-check-circle"></i>
                            </Boton>
                            <Boton color="morado" title="Editar" size="icon" forma="pastilla" onClick={() => handleEdit(doc)}>
                                <i className="bi bi-pencil-square mb-2 me-2 mt-2 ms-2"></i>
                            </Boton>
                        </div>
                    );
                } else if (doc.status === 'APLICADA') {
                    return (
                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <Boton color="blanco" title="Ver Detalles" size="icon" forma="pastilla" onClick={() => handleView(doc)}>
                                <i className="bi bi-eye"></i>
                            </Boton>
                            <Boton color="rojo" title="Anular" size="icon" forma="pastilla" onClick={() => handleCancel(doc)}>
                                <i className="bi bi-x-circle"></i>
                            </Boton>
                        </div>
                    );
                } else if (doc.status === 'ANULADA') {
                    return (
                        <div className="d-flex gap-1 justify-content-center">
                            <Boton color="blanco" title="Ver Detalles" size="icon" forma="pastilla" onClick={() => handleView(doc)}>
                                <i className="bi bi-eye"></i>
                            </Boton>
                        </div>
                    );
                }
                return null;
            }
        }
    ];
    
    // Define las columnas según el módulo activo
    const isEsteModulo = activeModule === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? bankTransactionColumns : thisModuleColumns;
    
    // 3. Lógica de Búsqueda y API
    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setTransactions([]);

        // Lógica de datos quemados para la simulación
        if (codigoValue === 'TEST' && isEsteModulo) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setTransactions(mockBankTransactions);
            setIsLoading(false);
            return;
        } else if (codigoValue === 'TEST' && !isEsteModulo) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setTransactions(mockOtherModuleTransactions);
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = isEsteModulo
                ? `/api/banco/transacciones?codigo=${codigoValue}&start=${startDate}&end=${endDate}`
                : `/api/banco/transacciones-otros?codigo=${codigoValue}&start=${startDate}&end=${endDate}`;
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`Error al cargar las transacciones de ${isEsteModulo ? 'bancos' : 'otros módulos'}.`);
            }

            const data = await response.json();
            setTransactions(data);

        } catch (err) {
            setError(err);
            if (codigoValue) {
                const mockData = isEsteModulo ? mockBankTransactions : mockOtherModuleTransactions;
                setTransactions(mockData);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCodigoValue('');
        setStartDate('');
        setEndDate('');
        setTransactions([]);
    };

    // HANDLERS PARA BOTONES DE ORDENAMIENTO
    const handleOrderByState = () => {
        const sorted = [...transactions].sort((a, b) => {
            const statusOrder = { 'PENDIENTE': 1, 'APLICADA': 2, 'ANULADA': 3 };
            return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        });
        setTransactions(sorted);
        console.log('Ordenado por estado');
    };
    
    const handleOrderByDate = () => {
        const sorted = [...transactions].sort((a, b) => 
            new Date(b.transactionDate) - new Date(a.transactionDate)
        );
        setTransactions(sorted);
        console.log('Ordenado por fecha');
    };

    //----------------------------------------------------------------------
    // EFECTO PARA RECARGAR DATOS AL CAMBIAR DE MÓDULO
    // ----------------------------------------------------------------------
    React.useEffect(() => {
        if (isEsteModulo) {
            setTransactions(mockBankTransactions);
        } else {
            setTransactions(mockOtherModuleTransactions);
        }
        
        if (codigoValue) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModule, codigoValue]);

    return (
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
                onCodigoChange={setCodigoValue} 
                startDate={startDate}
                onStartDateChange={setStartDate} 
                endDate={endDate}
                onEndDateChange={setEndDate} 
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            
            {/* BOTONES DE ACCION PARA LA VISUALIZACION DE TABLAS */}
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
                    {isEsteModulo && (
                        <Boton color="morado" forma="pastilla" onClick={handleNew}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva
                        </Boton>
                    )}

                    {isEsteModulo && (
                        <Boton color="blanco" forma="pastilla" onClick={handleOrderByState}>
                            Ordenar Por Estado
                        </Boton>
                    )}

                    <Boton color="blanco" forma="pastilla" onClick={handleOrderByDate}>
                        Ordenar Por Fecha
                    </Boton>
                </div>
            </div>
            
            {/* TABLA: RENDERIZADO DINÁMICO */}
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}> 
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTable
                            documents={transactions}
                            columns={currentColumns}
                            showRowActions={false}
                            styles={styles}
                            isLoading={isLoading}
                            isError={!!error}
                            error={error}
                            emptyMessage="Utilice el filtro de arriba para buscar transacciones."
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;