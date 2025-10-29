//imports generales
import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from "react-router-dom";

// --- IMPORTS NUEVOS ---
import { bankTransactionService } from '../../services/banks/banksService'; // 1. IMPORTA EL SERVICIO
import { Notifier } from '../../utils/alertUtils'; // 2. IMPORTA EL NOTIFIER PARA ALERTAS

//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { DocumentTable } from '../shared/DocumentTable';
import Boton from '../inventory/inventoryelements/Boton';

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


const BankTransactionsView = ({ apiDataCodigo }) => {
    
    // --- 2. ESTADOS DE FILTROS (NOMBRES CORREGIDOS) ---
    const [idCatalog, setIdCatalog] = useState(''); // 'codigoValue' ahora es 'idCatalog'
    const [dateFrom, setDateFrom] = useState('');   // 'startDate' ahora es 'dateFrom'
    const [dateTo, setDateTo] = useState('');     // 'endDate' ahora es 'dateTo'

    // --- 3. ESTADOS DE DATOS (INICIAN VACÍOS) ---
    const [transactions, setTransactions] = useState([]); // Inicia vacío
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [activeModule, setActiveModule] = useState('ESTE_MODULO');
    const navigate = useNavigate();

    // --- 4. FUNCIÓN CENTRAL PARA CARGAR DATOS ---
    const loadTransactions = async () => {
        // Solo carga si es "Este Módulo" (el único que tiene API por ahora)
        if (activeModule !== 'ESTE_MODULO') {
            setTransactions([]); // O pon los datos mock de "Otros Módulos" si quieres
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Prepara los filtros
            const filters = { idCatalog, dateFrom, dateTo };
            const data = await bankTransactionService.listAll(filters);
            
            // ¡IMPORTANTE! Mapea los datos de la API a los que espera la tabla
            // Tu API tiene 'idBankTransaction', 'totalAmount', 'accountingTransactionStatus'
            // Tu tabla espera 'id', 'amount', 'status'
            const mappedData = data.map(tx => ({
                id: tx.idBankTransaction, // Mapeo
                correlative: tx.idBankTransaction, // Asumiendo que el correlativo es el ID
                transactionDate: tx.transactionDate,
                referenceNumber: tx.receiptNumber, // Mapeo
                description: tx.description,
                amount: tx.totalAmount, // Mapeo
                status: tx.accountingTransactionStatus // Mapeo
            }));
            
            setTransactions(mappedData);

        } catch (err) {
            console.error("Error al cargar transacciones:", err);
            setError("No se pudieron cargar las transacciones.");
            Notifier.error("Error al cargar datos."); // Alerta
        } finally {
            setIsLoading(false);
        }
    };

    // --- 5. LLAMADA A DATOS AL MONTAR EL COMPONENTE ---
    useEffect(() => {
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModule]); // Se recarga si cambias entre "Este Módulo" y "Otros"


    // --- 6. HANDLERS DE ACCIONES REFACTORIZADOS ---
    
    const handleNew = () => {
        navigate('/bancos/transacciones/nueva'); 
    };
    
    const handleEdit = (doc) => {
        // Navegamos a la ruta de edición CON el ID
        navigate(`/bancos/transacciones/editar/${doc.id}`);
    };
    
    const handleView = (doc) => {
        // Navegamos a la ruta de ver CON el ID
        navigate(`/bancos/transacciones/ver/${doc.id}`); 
    };

    // --- ACCIONES ASÍNCRONAS (DELETE, APPROVE, CANCEL) ---

    const handleDelete = async (doc) => {
        if (window.confirm(`¿Está seguro de eliminar la transacción "${doc.referenceNumber}"?`)) {
            try {
                await bankTransactionService.delete(doc.id);
                Notifier.success("Transacción eliminada con éxito.");
                loadTransactions(); // Recarga la tabla
            } catch (err) {
                console.error("Error al eliminar:", err);
                Notifier.error("Error al eliminar la transacción.");
            }
        }
    };
    
    const handleApprove = async (doc) => {
        if (window.confirm(`¿Está seguro de aplicar la transacción "${doc.referenceNumber}"?`)) {
            try {
                await bankTransactionService.apply(doc.id);
                Notifier.success("Transacción aplicada con éxito.");
                loadTransactions(); // Recarga la tabla
            } catch (err) {
                console.error("Error al aplicar:", err);
                Notifier.error(err.message || "Error al aplicar la transacción.");
            }
        }
    };
    
    const handleCancel = async (doc) => {
        if (window.confirm(`¿Está seguro de anular la transacción "${doc.referenceNumber}"?`)) {
            try {
                await bankTransactionService.annul(doc.id);
                Notifier.success("Transacción anulada con éxito.");
                loadTransactions(); // Recarga la tabla
            } catch (err) {
                console.error("Error al anular:", err);
                Notifier.error(err.message || "Error al anular la transacción.");
            }
        }
    };

    // ... (Tu definición de 'bankTransactionColumns' se queda igual, con los handlers) ...
        const bankTransactionColumns = [
            // ... (columna correlativo, fecha, referencia, descripción) ...
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
                // APLICA ESTILOS SEGÚN EL ESTADO (OPCIONAL PERO RECOMENDADO)
                style: { width: '90px', textAlign: 'center' },
                cell: (doc) => {
                    let className = '';
                    if (doc.status === 'PENDIENTE') className = styles.statusPending;
                    if (doc.status === 'APLICADA') className = styles.statusApplied;
                    if (doc.status === 'ANULADA') className = styles.statusAnnulled;
                    return <span className={className}>{doc.status}</span>;
                }
            },
            { 
                header: 'Monto', 
                accessor: 'amount',
                cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
                style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
            },
            // COLUMNA DE ACCIONES (Tus botones ya llaman a los nuevos handlers)
            {
                header: 'Acciones',
                accessor: 'actions',
                style: { width: '210px', textAlign: 'center' },
                cell: (doc) => {
                    // (Tu lógica de botones condicionales se queda aquí... es correcta)
                    if (doc.status === 'PENDIENTE') {
                        return (
                            <div className="d-flex gap-1 justify-content-center flex-wrap">
                                {/* ... (tus botones Ver, Eliminar, Aplicar, Editar) ... */}
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
                                {/* ... (tus botones Ver, Anular) ... */}
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
                                {/* ... (tu botón Ver) ... */}
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

    
    const isEsteModulo = activeModule === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? bankTransactionColumns : thisModuleColumns;
    
    // 7. HANDLERS DE BÚSQUEDA Y LIMPIEZA
    const handleSearch = () => {
        // El botón "Buscar" ahora solo llama a la función de carga
        loadTransactions();
    };

    const handleClear = () => {
        setIdCatalog('');
        setDateFrom('');
        setDateTo('');
        setTransactions([]);
        setError(null);
    };

    const handleOrderByState = () => {
        const sorted = [...transactions].sort((a, b) => {
            const statusOrder = { 'PENDIENTE': 1, 'APLICADA': 2, 'ANULADA': 3 };
                // Sorts based on the order defined in statusOrder
        return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        });
        setTransactions(sorted); // Updates the state with the sorted array
        console.log('Ordenado por estado'); // You added this log
    };

    const handleOrderByDate = () => {
        const sorted = [...transactions].sort((a, b) => 
            // Sorts descending (newest first)
            new Date(b.transactionDate) - new Date(a.transactionDate)
        );
        setTransactions(sorted); // Updates the state
        console.log('Ordenado por fecha'); // You added this log
    };

    // React.useEffect(() => { ... }, [activeModule, codigoValue]);

    return (
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>Gestión de Transacciones Bancarias</h2>
            </div>
            
            {/* 8. PASAMOS LAS PROPS CORREGIDAS A SearchCardBank */}
            <SearchCardBank
                apiDataCodigo={apiDataCodigo}
                
                // Nombres corregidos
                codigoValue={idCatalog}
                onCodigoChange={setIdCatalog} 
                startDate={dateFrom}
                onStartDateChange={setDateFrom} 
                endDate={dateTo}
                onEndDateChange={setDateTo} 
                
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            
            {/* ... (Todo tu JSX de botones de Módulo, 'Nueva', 'Ordenar', etc. se queda igual) ... */}
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
            
            {/* ... (Tu JSX de la tabla se queda igual, ahora recibe los datos de la API) ... */}
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
                            error={error ? "Error al cargar datos" : null}
                            emptyMessage={isEsteModulo 
                                ? "No se encontraron transacciones. Pruebe a cambiar los filtros."
                                : "Vista de 'Otros Módulos' (aún no conectada)."
                            }
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;