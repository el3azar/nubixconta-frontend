import React, { useState } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import SelectBase from "../inventory/inventoryelements/SelectBase";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil';
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

import { Notifier } from '../../utils/alertUtils';
import { useBankTransactionService } from "../../services/banks/bankTransactionService";

const NewBankTransaction = () => {
    const navigate = useNavigate();
    const { createBankTransaction } = useBankTransactionService();

    const transactionTypesOptions = [
        { value: 'TRANSFERENCIA', label: 'Transferencia' },
        { value: 'EFECTIVO', label: 'Efectivo' },
        { value: 'REMESA', label: 'Remesa' },
    ];

    const [header, setHeader] = useState({
        transactionDate: '',
        receiptNumber: '',
        description: '',
        transactionType: null,
        companyId: 1
    });

    const [bankEntries, setBankEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const detailColumns = [
        { header: 'Cuenta', accessor: 'accountName' },
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${Number(doc.debit).toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${Number(doc.credit).toFixed(2)}`, className: styles.textAlignRight },
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

    const handleDeleteDetail = async (indexToDelete) => {
        const userConfirmed = await Notifier.confirm({
             title: '¿Estás seguro?',
             text: "No podrás revertir esta acción.",
             confirmButtonText: 'Sí, eliminar'
});

      
        if (userConfirmed.isConfirmed) {
            // Este bloque ahora SÓLO se ejecuta si el usuario hace clic en 'Sí, eliminar'.
            setBankEntries(prev => prev.filter((_, index) => index !== indexToDelete));
            Notifier.info('Línea de asiento eliminada.');
        }
  
    };

    const totalDebe = bankEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    const balance = totalDebe - totalHaber;

    const handleSaveTransaction = async () => {
        if (!header.transactionDate || !header.receiptNumber || !header.description || !header.transactionType) {
            Notifier.error('Todos los campos del encabezado son obligatorios.');
            return;
        }
        if (bankEntries.length < 2) {
            Notifier.error('La transacción debe tener al menos dos asientos.');
            return;
        }
        if (balance !== 0) {
            Notifier.error('La transacción no cuadra. El Debe y el Haber deben ser iguales.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const transactionData = {
                transactionDate: header.transactionDate,
                receiptNumber: header.receiptNumber,
                description: header.description,
                transactionType: header.transactionType.value,
                totalAmount: totalDebe,
                bankEntries: bankEntries.map(entry => ({
                    idCatalog: entry.idCatalog,
                    description: entry.description,
                    debit: entry.debit,
                    credit: entry.credit,
                }))
            };

            await createBankTransaction(transactionData);
            Notifier.success('Transacción bancaria registrada con éxito!');
            navigate('/bancos/transacciones');

        } catch (err) {
            const backendError = err.response?.data?.message || err.message || 'Error desconocido.';
            Notifier.error(`Error al guardar: ${backendError}`);
            setError('Error al guardar la transacción.');
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
                        <input
                            type="date"
                            name="transactionDate"
                            value={header.transactionDate}
                            onChange={handleHeaderChange}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles['trans-form-group']}>
                        <label className={styles.formLabel}>No. de Referencia:</label>
                        <input
                            type="text"
                            name="receiptNumber"
                            placeholder="Ej. CH-001"
                            value={header.receiptNumber}
                            onChange={handleHeaderChange}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles['trans-form-group']}>
                        <label className={styles.formLabel}>Tipo de Transacción:</label>
                        <SelectBase
                            options={transactionTypesOptions}
                            value={header.transactionType}
                            onChange={(selectedOption) => setHeader(prev => ({ ...prev, transactionType: selectedOption }))}
                            placeholder="Seleccione el tipo"
                        />
                    </div>
                    <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                        <label className={styles.formLabel}>Descripción General:</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Descripción de la transacción"
                            value={header.description}
                            onChange={handleHeaderChange}
                            className={styles.formInput}
                        />
                    </div>
                </div>
            </div>

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
                        {bankEntries.length > 0 ? (
                            bankEntries.map((entry, index) => (
                                // Se añade un 'key' único a cada fila para que React optimice el renderizado
                                <tr key={index}>
                                    <td>{entry.accountName}</td>
                                    <td>{entry.description}</td>
                                    <td className={styles.textAlignRight}>${Number(entry.debit).toFixed(2)}</td>
                                    <td className={styles.textAlignRight}>${Number(entry.credit).toFixed(2)}</td>
                                    <td className={styles.textAlignCenter}>
                                        {/* El botón se renderiza aquí directamente */}
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Boton color="rojo" title="Eliminar" size="icon" forma="pastilla" onClick={() => handleDeleteDetail(index)}>
                                                <i className="bi bi-trash"></i>
                                            </Boton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Mensaje para cuando no hay asientos en la tabla
                            <tr>
                                <td colSpan={detailColumns.length} style={{ textAlign: 'center' }}>
                                    Añada asientos a la transacción.
                                </td>
                            </tr>
                        )}
                        
                        {/* Las filas de Total y Balance se mantienen igual */}
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
                    disabled={isLoading || balance !== 0}
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