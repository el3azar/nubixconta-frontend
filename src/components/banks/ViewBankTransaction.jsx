import React, { useState, useEffect } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate, useParams } from "react-router-dom"; // Importa useParams
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
// SCardUtil no se importa, es solo lectura
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

// --- NUEVOS IMPORTS ---
import { bankTransactionService } from '../../services/banks/banksService';
import { Notifier } from '../../utils/alertUtils';
import SelectBase from "../inventory/inventoryelements/SelectBase"; // Importamos SelectBase para mostrarlo deshabilitado

const ViewBankTransaction = ({ apiDataTipo }) => { // Solo necesitamos apiDataTipo para el 'Select'

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

    const [isLoading, setIsLoading] = useState(true); // Inicia en true
    const [error, setError] = useState(null);

    // --- 2. CARGA DE DATOS ---
    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await bankTransactionService.getById(id);
                
                setHeader({
                    transactionDate: data.transactionDate.split('T')[0], // Formato YYYY-MM-DD
                    receiptNumber: data.receiptNumber,
                    description: data.description,
                    transactionType: data.transactionType,
                    companyId: data.companyId
                });
                setBankEntries(data.bankEntries);

            } catch (err) {
                Notifier.error("Error al cargar la transacción.");
                setError(err.message);
                navigate('/bancos/transacciones'); 
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [id, navigate]);


    // --- 3. LÓGICA DE LA TABLA (SIN ACCIONES) ---
    
    const detailColumns = [
        { header: 'Cuenta', accessor: 'idCatalog' }, 
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${doc.debit.toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${doc.credit.toFixed(2)}`, className: styles.textAlignRight },
        // --- Sin columna de Acciones ---
    ];

    // Cálculo de Totales
    const totalDebe = bankEntries.reduce((sum, item) => sum + item.debit, 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + item.haber, 0);
    const balance = totalDebe - totalHaber;

    const handleReturnTransaction = () => {
        navigate('/bancos/transacciones'); 
    }

    // --- 4. RENDERIZADO ---
    if (isLoading) {
        return <div>Cargando datos de la transacción...</div>;
    }

    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h2>Ver Transacción de Banco (ID: {id})</h2>
        </div>
        <div className="mb-3"> 
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i> Volver a la Lista
            </Boton>
        </div>

        {/* --- FORMULARIO DE ENCABEZADO (SOLO LECTURA) --- */}
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Encabezado de la Transacción</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '18px' }}>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Fecha:</label>
                    <input type="date" name="transactionDate" value={header.transactionDate} disabled />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>No. de Referencia:</label>
                    <input type="text" name="receiptNumber" value={header.receiptNumber} disabled />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Tipo (ENTRADA/SALIDA):</label>
                    <SelectBase
                        apiData={apiDataTipo} 
                        value={header.transactionType}
                        disabled
                    />
                </div>
                <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                    <label className={styles.formLabel}>Descripción General:</label>
                    <input type="text" name="description" value={header.description} disabled />
                </div>
            </div>
        </div>

        {/* --- SCardUtil NO SE RENDERIZA --- */}

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
                        emptyMessage="Esta transacción no tiene asientos."
                    />
                    {/* FILA DEL TOTAL */}
                    <tr className={styles.tableTotalRow} style={{ backgroundColor: '#bcb7dd', fontWeight: 'bold' }}>
                        <td colSpan={2}>Total</td> 
                        <td className={styles.textAlignRight}>${totalDebe.toFixed(2)}</td> 
                        <td className={styles.textAlignRight}>${totalHaber.toFixed(2)}</td>
                        {/* Sin celda de acciones */}
                    </tr>
                    {/* FILA DE BALANCE */}
                    <tr style={{ fontWeight: 'bold', backgroundColor: balance !== 0 ? '#ffcdd2' : '#c8e6c9' }}>
                        <td colSpan={2}>Balance (Debe - Haber)</td>
                        <td className={styles.textAlignRight}>${balance.toFixed(2)}</td>
                        <td>{balance !== 0 ? '¡No cuadra!' : '¡Cuadrado!'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* --- SIN BOTONES DE ACCIÓN PRINCIPAL --- */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
    )
}

export default ViewBankTransaction;