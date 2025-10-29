import React, { useState } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import SelectBase from "../inventory/inventoryelements/SelectBase";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil'; // El formulario de detalle
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

// --- NUEVOS IMPORTS ---
import { bankTransactionService } from '../../services/banks/banksService';
import { Notifier } from '../../utils/alertUtils';

// Asumiendo que 'apiDataCuenta' es el catálogo contable
const NewBankTransaction = ({ apiDataCuenta, apiDataTipo }) => {

    const navigate = useNavigate();

    // --- 1. ESTADO DEL ENCABEZADO (Header) ---
    const [header, setHeader] = useState({
        transactionDate: '',
        receiptNumber: '',
        description: '',
        transactionType: '', // Ej. 'ENTRADA' o 'SALIDA' (usando apiDataTipo)
        companyId: 1 // 🛑 Asumiendo ID 1, ¡debes obtener esto del contexto de usuario!
    });
    
    // --- 2. ESTADO DE LOS DETALLES (Bank Entries) ---
    // Inicia vacío, ya no con datos quemados
    const [bankEntries, setBankEntries] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 3. LÓGICA DE LA TABLA DE DETALLE ---
    
    // Columnas de la tabla de asientos
    const detailColumns = [
        // { header: 'Código', accessor: 'code' }, // 'idCatalog' es el ID, no el código visible
        { header: 'Cuenta', accessor: 'idCatalog' }, // O 'accountName' si lo guardas
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${doc.debit.toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${doc.credit.toFixed(2)}`, className: styles.textAlignRight },
        { 
            header: 'Acciones', 
            accessor: 'actions',
            className: styles.textAlignCenter,
            cell: (doc, index) => ( // Usamos 'index' para eliminar
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Boton color="rojo" title="Eliminar" size="icon" forma="pastilla" onClick={() => handleDeleteDetail(index)}>
                        <i className="bi bi-trash"></i>
                    </Boton>
                </div>
            )
        }
    ];

    // Función que SCardUtil llamará
    const handleAddDetail = (newDetail) => {
        // Validación de partida doble (simplificada)
        // Aquí deberías añadir la contrapartida de la cuenta de banco principal
        setBankEntries(prevEntries => [...prevEntries, newDetail]);
    };

    // Función para eliminar un asiento de la tabla
    const handleDeleteDetail = (indexToDelete) => {
        if (window.confirm(`¿Está seguro de eliminar esta línea?`)) {
            setBankEntries(prev => prev.filter((_, index) => index !== indexToDelete));
        }
    };

    // --- LOG ---
    console.log("Current bankEntries state:", bankEntries);
    // --------------------

    // Cálculo de Totales
    const totalDebe = bankEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    const balance = totalDebe - totalHaber;

    // --- 4. LÓGICA DE GUARDADO (EL BOTÓN PRINCIPAL) ---

    const handleSaveTransaction = async () => {
        if (!header.transactionDate || !header.description || !header.transactionType) {
            Notifier.warning('Complete los campos del encabezado: Fecha, Descripción y Tipo.');
            return;
        }
        if (bankEntries.length < 2) {
            Notifier.warning('La transacción debe tener al menos dos asientos (partida doble).');
            return;
        }
        if (balance !== 0) {
            Notifier.error(`La partida no cuadra. Balance: $${balance.toFixed(2)}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Prepara el DTO final
            const transactionData = {
                ...header, // Copia fecha, descripción, receiptNumber, companyId

                // Sobreescribe 'transactionType' para enviar solo el valor string.
                transactionType: header.transactionType ? header.transactionType.value : null,
                // ---------------------------------------------

                bankEntries: bankEntries // El arreglo de detalles
            };
            // ------------------------

            console.log("Enviando a la API:", transactionData); // Verifica que transactionType sea string aquí
            await bankTransactionService.create(transactionData);

            Notifier.success('Transacción registrada con éxito!');
            navigate('/bancos/transacciones'); // Vuelve a la lista

        } catch (err) {
            console.error("Error al guardar:", err);
            setError('Error al guardar la transacción.');
            // Muestra el error específico del backend si existe
            const backendError = err.response?.data?.message || err.message || 'Error desconocido.';
            Notifier.error(`Error al guardar: ${backendError}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnTransaction = () => {
        navigate('/bancos/transacciones'); 
    }

    // Handler para actualizar el estado del encabezado
    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader(prev => ({ ...prev, [name]: value }));
    };
    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h2>Nueva Transacción de Banco</h2>
        </div>
        <div className="mb-3"> 
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i> Volver
            </Boton>
        </div>

        {/* --- 5. FORMULARIO DE ENCABEZADO (Manual) --- */}
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Encabezado de la Transacción</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '18px' }}>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Fecha:</label>
                    <input type="date" name="transactionDate" value={header.transactionDate} onChange={handleHeaderChange} />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>No. de Referencia:</label>
                    <input type="text" name="receiptNumber" placeholder="Ej. CH-001" value={header.receiptNumber} onChange={handleHeaderChange} />
                </div>
                <div className={styles['trans-form-group']}>
                    <label className={styles.formLabel}>Tipo (ENTRADA/SALIDA):</label>
                    <SelectBase
                        apiData={apiDataTipo} // Asumo que esto es [{ value: 'ENTRADA', label: 'Entrada' }, ...]
                        value={header.transactionType}
                        onChange={(value) => setHeader(prev => ({ ...prev, transactionType: value }))}
                        placeholder="Seleccione el tipo"
                    />
                </div>
                <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                    <label className={styles.formLabel}>Descripción General:</label>
                    <input type="text" name="description" placeholder="Descripción de la transacción" value={header.description} onChange={handleHeaderChange} />
                </div>
            </div>
        </div>

        {/* --- 6. FORMULARIO DE DETALLES (SCardUtil) --- */}
        <SCardUtil
            apiDataAccount={apiDataCuenta}
            onAddDetail={handleAddDetail}
        />

        {/* --- 7. TABLA DE DETALLES --- */}
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

        {/* --- 8. BOTONES DE ACCIÓN PRINCIPAL --- */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <div className="d-flex gap-2 flex-wrap mt-4 justify-content-end">
            <Boton 
                color="verde" 
                forma="pastilla" 
                onClick={handleSaveTransaction}
                disabled={isLoading}
            >
                {isLoading ? 'Registrando...' : 'Registrar Transacción'}
            </Boton>
            <Boton color="rojo" forma="pastilla" onClick={handleReturnTransaction}>
                Cancelar
            </Boton>
        </div>
        </>
    )
}

export default NewBankTransaction;