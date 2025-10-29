import React, { useState, useEffect } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import SelectBase from "../inventory/inventoryelements/SelectBase";
import { useNavigate, useParams } from "react-router-dom"; // Importa useParams
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil'; // El formulario de detalle
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

// --- NUEVOS IMPORTS ---
import { bankTransactionService } from '../../services/banks/banksService';
import { Notifier } from '../../utils/alertUtils';

// Asumiendo que 'apiDataCuenta' es el catálogo contable
const EditBankTransaction = ({ apiDataCuenta, apiDataTipo }) => {

    const { id } = useParams(); // 1. Obtiene el ID desde la URL
    const navigate = useNavigate();

    // --- ESTADO DEL ENCABEZADO (Header) ---
    const [header, setHeader] = useState({
        transactionDate: '',
        receiptNumber: '',
        description: '',
        transactionType: '', 
        companyId: 1
    });
    
    // --- ESTADO DE LOS DETALLES (Bank Entries) ---
    const [bankEntries, setBankEntries] = useState([]);

    const [isLoading, setIsLoading] = useState(true); // Inicia en true para la carga inicial
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false); // Estado para controlar si se puede editar

    // --- 2. CARGA DE DATOS AL MONTAR EL COMPONENTE ---
    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await bankTransactionService.getById(id);
                
                const tipoObjeto = apiDataTipo.find(tipo => tipo.value === data.transactionType);

                // Rellena los estados con los datos de la API
                setHeader({
                    transactionDate: data.transactionDate.split('T')[0], // Formato YYYY-MM-DD
                    receiptNumber: data.receiptNumber,
                    description: data.description,
                    transactionType: tipoObjeto || null,
                    companyId: data.companyId
                });
                setBankEntries(data.bankEntries);

                // Comprueba si se puede editar
                if (data.accountingTransactionStatus === 'PENDIENTE') {
                    setIsEditable(true);
                } else {
                    setIsEditable(false);
                    Notifier.warning('Esta transacción no está PENDIENTE y no puede ser editada.');
                }

            } catch (err) {
                Notifier.error("Error al cargar la transacción.");
                setError(err.message);
                navigate('/bancos/transacciones'); // Si falla, regresa a la lista
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [id, navigate, apiDataTipo]); // Depende del ID y navigate


    // --- 3. LÓGICA DE LA TABLA DE DETALLE ---
    
    const detailColumns = [
        { header: 'Cuenta', accessor: 'idCatalog' }, 
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${doc.debit.toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${doc.credit.toFixed(2)}`, className: styles.textAlignRight },
        { 
            header: 'Acciones', 
            accessor: 'actions',
            className: styles.textAlignCenter,
            cell: (doc, index) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Boton 
                        color="rojo" 
                        title="Eliminar" 
                        size="icon" 
                        forma="pastilla" 
                        onClick={() => handleDeleteDetail(index)}
                        disabled={!isEditable} // Deshabilitado si no es editable
                    >
                        <i className="bi bi-trash"></i>
                    </Boton>
                </div>
            )
        }
    ];

    const handleAddDetail = (newDetail) => {
        if (!isEditable) return; // No añadir si no es editable
        setBankEntries(prevEntries => [...prevEntries, newDetail]);
    };

    const handleDeleteDetail = (indexToDelete) => {
        if (!isEditable) return; 
        if (window.confirm(`¿Está seguro de eliminar esta línea?`)) {
            setBankEntries(prev => prev.filter((_, index) => index !== indexToDelete));
        }
    };

    // Cálculo de Totales
    const totalDebe = bankEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    const balance = totalDebe - totalHaber;

    // --- 4. LÓGICA DE GUARDADO (ACTUALIZACIÓN) ---

    const handleUpdateTransaction = async () => {
        if (!isEditable) {
            Notifier.error('No se puede guardar una transacción que no está PENDIENTE.');
            return;
        }
        // Validaciones
        if (!header.transactionDate || !header.description || !header.transactionType) {
            Notifier.warning('Complete los campos del encabezado: Fecha, Descripción y Tipo.');
            return;
        }
        if (bankEntries.length < 2) {
            Notifier.warning('La transacción debe tener al menos dos asientos.');
            return;
        }
        if (balance !== 0) {
            Notifier.error(`La partida no cuadra. Balance: $${(balance || 0).toFixed(2)}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const transactionData = {
                ...header,
                transactionType: header.transactionType ? header.transactionType.value : null,
                bankEntries: bankEntries
            };

            await bankTransactionService.update(id, transactionData);
            
            Notifier.success('Transacción actualizada con éxito!');
            navigate('/bancos/transacciones'); // Vuelve a la lista
            
        } catch (err) {
            console.error("Error al actualizar:", err);
            setError('Error al actualizar la transacción.');
            Notifier.error(err.message || 'Error al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnTransaction = () => {
        navigate('/bancos/transacciones'); 
    }

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader(prev => ({ ...prev, [name]: value }));
    };

    // --- 5. RENDERIZADO ---
    if (isLoading) {
        return <div>Cargando datos de la transacción...</div>; // Pantalla de carga
    }

    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h2>Editar Transacción de Banco (ID: {id})</h2>
        </div>
        <div className="mb-3"> 
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i> Volver
            </Boton>
        </div>

        {/* --- FORMULARIO DE ENCABEZADO --- */}
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Encabezado de la Transacción</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '18px' }}>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Fecha:</label>
                    <input type="date" name="transactionDate" value={header.transactionDate} onChange={handleHeaderChange} disabled={!isEditable} />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>No. de Referencia:</label>
                    <input type="text" name="receiptNumber" placeholder="Ej. CH-001" value={header.receiptNumber} onChange={handleHeaderChange} disabled={!isEditable} />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Tipo (ENTRADA/SALIDA):</label>
                    <SelectBase
                        apiData={apiDataTipo} 
                        value={header.transactionType}
                        onChange={(value) => setHeader(prev => ({ ...prev, transactionType: value }))}
                        placeholder="Seleccione el tipo"
                        disabled={!isEditable}
                    />
                </div>
                <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                    <label className={styles.formLabel}>Descripción General:</label>
                    <input type="text" name="description" placeholder="Descripción de la transacción" value={header.description} onChange={handleHeaderChange} disabled={!isEditable} />
                </div>
            </div>
        </div>

        {/* --- FORMULARIO DE DETALLES (SCardUtil) --- */}
        {/* Solo se muestra si la transacción es editable */}
        {isEditable && (
            <SCardUtil
                apiDataAccount={apiDataCuenta}
                onAddDetail={handleAddDetail}
            />
        )}

        {/* --- TABLA DE DETALLES --- */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
            <h3>Detalle de la Transacción (Asientos)</h3>
        </div>

        <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
                <thead className={styles.table_header}>
                    <tr>
                        {detailColumns.map(col => (
                            <th key={col.header} className={col.className}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <DocumentTable
                        documents={bankEntries}
                        columns={detailColumns}
                        styles={styles} 
                        showRowActions={false}
                        emptyMessage="Añada asientos a la transacción."
                    />
                    {/* FILA DEL TOTAL */}
                    <tr className={styles.tableTotalRow} style={{ backgroundColor: '#bcb7dd', fontWeight: 'bold' }}>
                        <td colSpan={2}>Total</td> 
                        <td className={styles.textAlignRight}>${(totalDebe || 0).toFixed(2)}</td>
                        <td className={styles.textAlignRight}>${(totalHaber || 0).toFixed(2)}</td>
                        <td></td> 
                    </tr>
                    {/* FILA DE BALANCE */}
                    <tr style={{ fontWeight: 'bold', backgroundColor: balance !== 0 ? '#ffcdd2' : '#c8e6c9' }}>
                        <td colSpan={2}>Balance (Debe - Haber)</td>
                        <td colSpan={2} className={styles.textAlignRight}>${(balance || 0).toFixed(2)}</td>
                        <td>{balance !== 0 ? '¡No cuadra!' : '¡Cuadrado!'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* --- BOTONES DE ACCIÓN PRINCIPAL --- */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <div className="d-flex gap-2 flex-wrap mt-4 justify-content-end">
            {isEditable && (
                <Boton 
                    color="verde" 
                    forma="pastilla" 
                    onClick={handleUpdateTransaction}
                    disabled={isLoading}
                >
                    {isLoading ? 'Actualizando...' : 'Actualizar Transacción'}
                </Boton>
            )}
            <Boton color="rojo" forma="pastilla" onClick={handleReturnTransaction}>
                {isEditable ? 'Cancelar' : 'Volver'}
            </Boton>
        </div>
        </>
    )
}

export default EditBankTransaction;