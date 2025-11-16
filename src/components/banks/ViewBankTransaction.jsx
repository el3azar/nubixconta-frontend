import React, { useState, useEffect } from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate, useParams } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

import { bankTransactionService } from '../../services/banks/banksService';
import { Notifier } from '../../utils/alertUtils';
import SelectBase from "../inventory/inventoryelements/SelectBase";
import { DocumentTableBank } from "../shared/TableBank";


const ViewBankTransaction = () => {

    const { id } = useParams();
    const navigate = useNavigate();


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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await bankTransactionService.getById(id);

                // Se busca el objeto de tipo de transacción en la constante local.
                const tipoObjeto = transactionTypesOptions.find(tipo => tipo.value === data.transactionType);

                setHeader({
                    transactionDate: data.transactionDate.split('T')[0],
                    receiptNumber: data.receiptNumber,
                    description: data.description,
                    transactionType: tipoObjeto || null, // Se asigna el objeto encontrado
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

    const detailColumns = [
        { header: 'Cuenta', accessor: 'idCatalog' },
        { header: 'Descripción', accessor: 'description' },
        { header: 'Debe', accessor: 'debit', cell: (doc) => `$${(Number(doc.debit) || 0).toFixed(2)}`, className: styles.textAlignRight },
        { header: 'Haber', accessor: 'credit', cell: (doc) => `$${(Number(doc.credit) || 0).toFixed(2)}`, className: styles.textAlignRight },
    ];

    const totalDebe = bankEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalHaber = bankEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    const balance = totalDebe - totalHaber;

    const handleReturnTransaction = () => {
        navigate('/bancos/transacciones');
    }

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
                        <label className={styles.formLabel}>Tipo:</label>
                        <SelectBase
                            options={transactionTypesOptions} // Se usan las opciones locales
                            value={header.transactionType}
                            isDisabled
                            placeholder="No especificado"
                        />
                    </div>
                    <div className={styles['trans-form-group']} style={{ gridColumn: '1 / span 3' }}>
                        <label className={styles.formLabel}>Descripción General:</label>
                        <input type="text" name="description" value={header.description} disabled />
                    </div>
                </div>
            </div>

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
                        <DocumentTableBank
                            documents={bankEntries}
                            columns={detailColumns}
                            styles={styles}
                            showRowActions={false}
                            emptyMessage="Esta transacción no tiene asientos."
                        />
                        <tr className={styles.tableTotalRow} style={{ backgroundColor: '#bcb7dd', fontWeight: 'bold' }}>
                            <td colSpan={2}>Total</td>
                            <td className={styles.textAlignRight}>${(totalDebe || 0).toFixed(2)}</td>
                            <td className={styles.textAlignRight}>${(totalHaber || 0).toFixed(2)}</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: balance !== 0 ? '#ffcdd2' : '#c8e6c9' }}>
                            <td colSpan={2}>Balance (Debe - Haber)</td>
                            <td colSpan={3} className={styles.textAlignRight}>${(balance || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
    )
}

export default ViewBankTransaction;