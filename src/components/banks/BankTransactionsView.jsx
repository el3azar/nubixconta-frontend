// src/components/banks/NewBankTransaction.jsx
import React, { useState } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import SelectBase from "../inventory/inventoryelements/SelectBase"; // Asegúrate de que este SelectBase es el que usas para apiDataTipo
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil'; // El formulario de detalle
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';
import { bankTransactionService } from '../../services/banks/banksService';
import { Notifier } from '../../utils/alertUtils';

// NewBankTransaction ya no necesita la prop apiDataCuenta
// const NewBankTransaction = ({ apiDataCuenta, apiDataTipo }) => {
const NewBankTransaction = ({ apiDataTipo }) => { // Solo apiDataTipo

    const navigate = useNavigate();

    const [header, setHeader] = useState({
        transactionDate: '',
        receiptNumber: '',
        description: '',
        transactionType: null, // Debería ser un objeto { value, label } si viene de SelectBase
        companyId: 1 // 🛑 ¡Obtén esto del contexto de usuario real!
    });

    const [bankEntries, setBankEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const detailColumns = [
        { header: 'Cuenta', accessor: 'accountName' }, // Mostrar el nombre de la cuenta
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${(doc.debit || 0).toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${(doc.credit || 0).toFixed(2)}`, className: styles.textAlignRight },
        {
            header: 'Acciones',
            accessor: 'actions',
            className: styles.textAlignCenter,
            cell: (doc, index) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Boton color="rojo" title="Eliminar" size="icon" forma="pastilla" onClick={() => handleDeleteDetail(index)}>
                        <i className="bi bi-trash"></i>
                    </Boton>
                </div>
            )
        }
    ];

    const handleAddDetail = (newDetail) => {
        setBankEntries(prevEntries => [...prevEntries, newDetail]);
    };

    const handleDeleteDetail = (indexToDelete) => {
        if (window.confirm(`¿Está seguro de eliminar esta línea?`)) {
            setBankEntries(prev => prev.filter((_, index) => index !== indexToDelete));
        }
    };

    console.log("Current bankEntries state:", bankEntries);

    const totalDebe = bankEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    const balance = totalDebe - totalHaber;

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
            const transactionData = {
                transactionDate: header.transactionDate,
                receiptNumber: header.receiptNumber,
                description: header.description,
                // Asegúrate de enviar solo el 'value' del tipo de transacción
                transactionType: header.transactionType ? header.transactionType.value : null,
                companyId: header.companyId,
                bankEntries: bankEntries.map(entry => ({
                    idCatalog: entry.idCatalog,
                    description: entry.description,
                    debit: entry.debit,
                    credit: entry.credit,
                })) // Mapear para enviar solo lo que el backend espera
            };

            console.log("Enviando a la API:", transactionData);
            await bankTransactionService.create(transactionData);

            Notifier.success('Transacción registrada con éxito!');
            navigate('/bancos/transacciones');

        } catch (err) {
            console.error("Error al guardar:", err);
            setError('Error al guardar la transacción.');
            const backendError = err.response?.data?.message || err.message || 'Error desconocido.';
            Notifier.error(`Error al guardar: ${backendError}`);
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
                        {/* Asume que este SelectBase es compatible con apiData y devuelve { value, label } */}
                        <SelectBase
                            apiData={apiDataTipo} // Este SelectBase sí usa apiData
                            value={header.transactionType}
                            onChange={(value) => setHeader(prev => ({ ...prev, transactionType: value }))}
                            placeholder="Seleccione el tipo"
                            // Aquí no necesitarías onSearchAsync porque apiDataTipo es una lista estática
                        />
                    </div>
                    <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                        <label className={styles.formLabel}>Descripción General:</label>
                        <input type="text" name="description" placeholder="Descripción de la transacción" value={header.description} onChange={handleHeaderChange} />
                    </div>
                </div>
            </div>

            {/* --- SCardUtil YA NO RECIBE apiDataAccount --- */}
            <SCardUtil
                onAddDetail={handleAddDetail}
            />

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
                        <tr className={styles.tableTotalRow} style={{ backgroundColor: '#bcb7dd', fontWeight: 'bold' }}>
                            <td colSpan={2}>Total</td>
                            <td className={styles.textAlignRight}>${(totalDebe || 0).toFixed(2)}</td>
                            <td className={styles.textAlignRight}>${(totalHaber || 0).toFixed(2)}</td>
                            <td></td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: balance !== 0 ? '#ffcdd2' : '#c8e6c9' }}>
                            <td colSpan={2}>Balance (Debe - Haber)</td>
                            <td colSpan={2} className={styles.textAlignRight}>${(balance || 0).toFixed(2)}</td>
                            <td>{balance !== 0 ? '¡No cuadra!' : '¡Cuadrado!'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

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