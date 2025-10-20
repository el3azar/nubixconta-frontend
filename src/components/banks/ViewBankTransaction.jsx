import React from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css'; 
import { DocumentTable } from '../shared/DocumentTable';

const ViewBankTransaction = ({
// Campos de entrada (inputs)
    referenceValue, onReferenceChange,
    dateValue, onDateChange,
    descriptionValue, onDescriptionChange,
    
    // NOTA: Las props de búsqueda como handleSearch y startDate/endDate se eliminan

}) => {
    // --- ESTADO CLAVE: DETALLE DE LA TRANSACCIÓN (ASIENTOS) ---
    // Simulación de los asientos contables (Debe/Haber) que componen el monto total.
    const [transactionDetails, setTransactionDetails] = React.useState([
        { id: 1, code: '110.01', accountName: 'Banco 1', debe: 1000.00, haber: 0.00, isMainAccount: true },
        { id: 2, code: '501.05', accountName: 'Gasto por Servicios', debe: 0.00, haber: 1000.00, isMainAccount: false }
    ]);
    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();
    const handleReturnTransaction = () => {
        // Ejemplo de ruta para volver a la lista de transacciones
        navigate('/bancos/transacciones'); 
    }

    // Usamos la sintaxis con corchetes para la clase con guion
    const TransFormGroup = styles['trans-form-group'];
    // --- LÓGICA DE LA TABLA ---

    // 1. Definición de las Columnas para el detalle contable
    const detailColumns = [
        { header: 'Código', accessor: 'code', className: styles.textAlignCenter },
        { header: 'Cuenta', accessor: 'accountName' },
        // Formato para los montos de Debe
        { header: 'Debe', accessor: 'debe', 
            cell: (doc) => `$${doc.debe.toFixed(2)}`, 
            className: styles.textAlignRight
        },
        // Formato para los montos de Haber
        { header: 'Haber', accessor: 'haber', 
            cell: (doc) => `$${doc.haber.toFixed(2)}`, 
            className: styles.textAlignRight
        },
    ];
    
    // 2. Cálculo de la Fila Total
    const totalDebe = transactionDetails.reduce((sum, item) => sum + item.debe, 0);
    const totalHaber = transactionDetails.reduce((sum, item) => sum + item.haber, 0);
    const totalColSpan = detailColumns.length; // Columna de Código + Cuenta
    const colSpanTotalLabel = 2; // Columna de Código + Cuenta (para el texto "Total")
    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h2>Ver Transacción de Banco</h2>
        </div>
        <div className="mb-3">
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i>
                Volver
            </Boton>
        </div>
        <div>
            {/* aca va el card */}
            <div className={styles.searchCard}>
                <div style={{ 
                    display: 'grid', 
                    // 4 columnas: 3 de contenido (1fr) + 1 para botones (auto)
                    gridTemplateColumns: '2fr 1fr 2fr',
                    // 3 filas de altura automática para los grupos de formulario
                    gridTemplateRows: 'auto auto auto',
                    gap: '18px', // Aumentamos el gap a 18px para un mejor espaciado
                    alignItems: 'start' // Alinea el contenido al inicio de cada fila
                }}>
                    
                    {/* --------------------- PRIMERA FILA (grid-row: 1) --------------------- */}
                    
                    {/* 1. No. de Referencia (Col 1, Fila 1) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                    <div className={TransFormGroup} style={{ gridColumn: 1, gridRow: 1 }}> 
                        <label className={styles.formLabel}>No. de Referencia:</label>
                        <input type="text" placeholder="Número de comprobante" value={referenceValue} onChange={(e) => onReferenceChange(e.target.value)} disabled/>
                    </div>
                    
                    {/* 2. Fecha (Col 2, Fila 1) - USA styles.fechaGrupo y POSICIÓN EXPLÍCITA */}
                    <div className={styles.fechaGrupo} style={{ gridColumn: 2, gridRow: 1 }}>
                        <label className={styles.formLabel}>Fecha:</label>
                        <input type="date" value={dateValue} onChange={(e) => onDateChange(e.target.value)} disabled/>
                    </div>
                    
                    {/* 3. Descripción (Col 3, Fila 1) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                    <div className={TransFormGroup} style={{ gridColumn: "3/ span 3", gridRow: 1 }}> 
                        <label className={styles.formLabel}>Descripción:</label>
                        <textarea 
                            placeholder="Descripción de la transacción" 
                            value={descriptionValue} 
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            rows={3} // ⬅️ Aumenta la altura a 3 líneas
                            style={{ resize: 'vertical' }} // Opcional: permite al usuario redimensionar solo verticalmente
                            disabled
                        />
                    </div>               
                </div>
            </div>
        </div>
        <div>
            {/* aca va la tabla */}
            <h3>Detalles de la Transacción</h3>
        </div>
        {/* 2. TABLA DE DETALLE CONTABLE */}
        <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
                {/* ENCABEZADO: Usamos las columnas definidas + la columna de Acciones */}
                <thead className={styles.table_header}>
                    <tr>
                        {detailColumns.map(col => (
                            <th key={col.header} className={col.className}>{col.header}</th>
                        ))}
                        
                    </tr>
                </thead>
                <tbody>
                    {/* Filas de DATOS (DocumentTable) */}
                    <DocumentTable
                        documents={transactionDetails}
                        columns={detailColumns}
                        styles={styles} 
                        // Mostrará la columna de Acciones (trash/search) en DocumentTable
                        showRowActions={false} 
                        // Aquí se pasarían las props de acciones (ej: onDelete, onEdit)
                        // actionsProps={{ handleDelete: onDeleteDetail, handleView: onEditDetail, ... }}
                        emptyMessage="Añada la cuenta de contrapartida de la transacción."
                    />

                    {/* FILA DEL TOTAL (Renderizada Manualmente) */}
                    <tr className={styles.tableTotalRow} style={{ backgroundColor: '#bcb7dd', fontWeight: 'bold' }}>
                        {/* La celda "Total" ocupa las columnas de "Código" y "Cuenta" */}
                        <td colSpan={colSpanTotalLabel}>Total</td> 
                        
                        {/* Total Debe */}
                        <td className={styles.textAlignRight}>${totalDebe.toFixed(2)}</td> 
                        
                        {/* Total Haber */}
                        <td className={styles.textAlignRight}>${totalHaber.toFixed(2)}</td>
                        
                        {/* Celda de Acciones (Vacía o con colspan de 1) */}
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    )
}   

export default ViewBankTransaction;