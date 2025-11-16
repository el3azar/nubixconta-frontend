// src/components/banks/BankTransactionsView.jsx
import React, { useState, useEffect } from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { formatDate } from '../../utils/dateFormatter';
import { useNavigate } from "react-router-dom";

// --- IMPORTS ACTUALIZADOS ---
import { bankTransactionService } from '../../services/banks/banksService'; // Servicio para 'Este Módulo'
import { useBankEntriesService } from '../../services/banks/BankEntriesService'; // Importa el NUEVO servicio
import { Notifier } from '../../utils/alertUtils';

//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { DocumentTable } from '../shared/DocumentTable';
import Boton from '../inventory/inventoryelements/Boton';

// Las columnas para 'Este Módulo' (BankTransactionsView original)
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

  const [accountName, setAccountName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [activeModule, setActiveModule] = useState('ESTE_MODULO'); // Estado para controlar qué módulo está activo
    const navigate = useNavigate();

    // --- INSTANCIA DEL NUEVO SERVICIO ---
    const { listAllBankEntries } = useBankEntriesService();

    // Las columnas para el endpoint de bank-entries
    const otherModuleColumns = [
        { header: 'Correlativo', accessor: 'id', style: { width: '80px', textAlign: 'center' } },
        { header: 'No. de asiento', accessor: 'id', style: { width: '100px', textAlign: 'center' } }, // Usamos id como asiento por ahora
        { header: 'Fecha de transacción', accessor: 'date', cell: (doc) => formatDate(doc.date), style: { width: '130px' } },
        { header: 'Modulo de origen', accessor: 'collection.moduleType', style: { width: '120px' } }, // Acceder a nested object
        { header: 'Cuenta bancaria', accessor: 'accountName', style: { width: '150px' } },
        { header: 'No. de referencia', accessor: 'collection.reference', style: { width: '130px', textAlign: 'center' } }, // Acceder a nested object
        { header: 'Descripcion de la transaccion', accessor: 'description', style: { flexGrow: 1 } },
        { header: 'Cargo', accessor: 'debit', cell: (doc) => `$${doc.debit ? doc.debit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } },
        { header: 'Abono', accessor: 'credit', cell: (doc) => `$${doc.credit ? doc.credit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } },
    ];

    const loadTransactions = async () => {
        setIsLoading(true);
        setError(null);
    

        try {
            if (activeModule === 'ESTE_MODULO') {
                // 1. Prepara el objeto de filtros con los nombres correctos
                const filters = { 
                    query: accountName, 
                    startDate: dateFrom, 
                    endDate: dateTo 
                };

                // 2. Llama a la nueva función del servicio
                const data = await bankTransactionService.search(filters);
                
                // 3. El mapeo de datos sigue siendo el mismo, ¡perfecto!
                const mappedData = data.map(tx => ({
                    id: tx.idBankTransaction,
                    correlative: tx.idBankTransaction,
                    transactionDate: tx.transactionDate,
                    referenceNumber: tx.receiptNumber,
                    description: tx.description,
                    amount: tx.totalAmount,
                    status: tx.accountingTransactionStatus
                }));
                setTransactions(mappedData);
            } else if (activeModule === 'OTROS_MODULOS') {
                // La lógica para otros módulos no necesita cambios
                const data = await listAllBankEntries({ accountName, dateFrom, dateTo }); 
                setTransactions(data);
            }

        } catch (err) {
            console.error("Error al cargar transacciones:", err);
            setError("No se pudieron cargar las transacciones.");
            Notifier.error("Error al cargar datos.");
        } finally {
            setIsLoading(false);
        }
    };
    


    useEffect(() => {
        loadTransactions();
        
    }, [activeModule]);

    const handleNew = () => {
        navigate('/bancos/transacciones/nueva');
    };

    const handleEdit = (doc) => {
        navigate(`/bancos/transacciones/editar/${doc.id}`);
    };

    const handleView = (doc) => {
        navigate(`/bancos/transacciones/ver/${doc.id}`);
    };

   const handleDelete = async (doc) => {
       
        const result = await Notifier.confirm({
            title: '¿Estás seguro?',
            text: `Esta acción eliminará la transacción "${doc.referenceNumber}". No se puede revertir.`,
            confirmButtonText: 'Sí, eliminar'
        });

        // 2. Revisa la propiedad "isConfirmed" del resultado
        if (result.isConfirmed) {
            try {
                if (activeModule === 'ESTE_MODULO') {
                    await bankTransactionService.delete(doc.id);
                    Notifier.success("Transacción eliminada con éxito.");
                    loadTransactions();
                } else {
                    Notifier.info("La eliminación no está disponible para 'Otros Módulos'.");
                }
            } catch (err) {
                console.error("Error al eliminar:", err);
                Notifier.error("Error al eliminar la transacción.");
            }
        }
    };

    const handleApprove = async (doc) => {
        const result = await Notifier.confirm({
            title: 'Confirmar Aplicación',
            text: `¿Deseas aplicar la transacción "${doc.referenceNumber}"?`,
            confirmButtonText: 'Sí, aplicar'
        });

        if (result.isConfirmed) {
            try {
                if (activeModule === 'ESTE_MODULO') {
                    await bankTransactionService.apply(doc.id);
                    Notifier.success("Transacción aplicada con éxito.");
                    loadTransactions();
                } else {
                    Notifier.info("La aplicación no está disponible para 'Otros Módulos'.");
                }
            } catch (err) {
                console.error("Error al aplicar:", err);
                Notifier.error(err.message || "Error al aplicar la transacción.");
            }
        }
    };

    const handleCancel = async (doc) => {
        const result = await Notifier.confirm({
            title: 'Confirmar Anulación',
            text: `¿Deseas anular la transacción "${doc.referenceNumber}"?`,
            confirmButtonText: 'Sí, anular'
        });

        if (result.isConfirmed) {
            try {
                if (activeModule === 'ESTE_MODULO') {
                    await bankTransactionService.annul(doc.id);
                    Notifier.success("Transacción anulada con éxito.");
                    loadTransactions();
                } else {
                    Notifier.info("La anulación no está disponible para 'Otros Módulos'.");
                }
            } catch (err) {
                console.error("Error al anular:", err);
                Notifier.error(err.message || "Error al anular la transacción.");
            }
        }
    };



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
        {
        
            header: 'Acciones',
            accessor: 'actions',
            style: { width: '210px', textAlign: 'center' },
            cell: (doc) => {
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
                } 
                return null;
            }
        }
    ];

    const isEsteModulo = activeModule === 'ESTE_MODULO';
    // Se eligen las columnas dinámicamente
    const currentColumns = isEsteModulo ? bankTransactionColumns : otherModuleColumns;

    const handleSearch = () => {
        loadTransactions();
    };

    const handleClear = () => {
        setAccountName('');
        setDateFrom('');
        setDateTo('');
        setTransactions([]);
        setError(null);
    };

    const handleOrderByState = () => {
        // Solo tiene sentido ordenar por estado para "Este Módulo"
        if (activeModule === 'ESTE_MODULO') {
            const sorted = [...transactions].sort((a, b) => {
                const statusOrder = { 'PENDIENTE': 1, 'APLICADA': 2, 'ANULADA': 3 };
                return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
            });
            setTransactions(sorted);
            Notifier.info('Ordenado por estado.');
        } else {
            Notifier.info('La opción "Ordenar por Estado" solo aplica para "Este Módulo".');
        }
    };

    const handleOrderByDate = () => {
        const sorted = [...transactions].sort((a, b) =>
            new Date(b.transactionDate || b.date) - new Date(a.transactionDate || a.date)
        );
        setTransactions(sorted);
        Notifier.info('Ordenado por fecha.');
    };


    return (
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>Gestión de Transacciones Bancarias</h2>
            </div>

            <SearchCardBank
               accountName={accountName}
                onAccountNameChange={setAccountName}
                startDate={dateFrom}
                onStartDateChange={setDateFrom}
                endDate={dateTo}
                onEndDateChange={setDateTo}
                handleSearch={handleSearch}
                handleClear={handleClear}
            />

            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
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

                <div className="d-flex gap-2 flex-wrap">
                    {isEsteModulo && (
                        <Boton color="morado" forma="pastilla" onClick={handleNew}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva
                        </Boton>
                    )}

                    {/* Mostrar "Ordenar por Estado" solo para "Este Módulo" */}
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

            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}>
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                            {/* La columna de acciones solo para "Este Módulo" */}
                          
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTable
                            documents={transactions}
                            columns={currentColumns}
                            showRowActions={isEsteModulo}
                            disableGenericActions={true} 
                            styles={styles}
                            isLoading={isLoading}
                            isError={!!error}
                            error={error ? "Error al cargar datos" : null}
                            emptyMessage={isEsteModulo
                                ? "No se encontraron transacciones. Pruebe a cambiar los filtros."
                                : "No se encontraron entradas bancarias de otros módulos. Pruebe a cambiar los filtros."
                            }
                           
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;