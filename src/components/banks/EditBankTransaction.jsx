import React from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil';
import { DocumentTable } from '../shared/DocumentTable';
import styles from '../../styles/banks/Banks.module.css';

const EditBankTransaction = ({ apiDataCuenta, apiDataTipo }) => {
    // 🛑 1. ELIMINACIÓN DE ESTADOS DE BÚSQUEDA Y DEFINICIÓN DE ESTADOS DE FORMULARIO
    
    // Estados del Formulario
    const [reference, setReference] = React.useState('');
    const [date, setDate] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [accountId, setAccountId] = React.useState(''); // Valor del SelectBase para la cuenta
    const [balance, setBalance] = React.useState('');
    const [type, setType] = React.useState(''); // Valor del SelectBase para el tipo (Cargo/Abono)
    
     // --- ESTADO CLAVE: DETALLE DE LA TRANSACCIÓN (ASIENTOS) ---
    // Simulación de los asientos contables (Debe/Haber) que componen el monto total.
    const [transactionDetails, setTransactionDetails] = React.useState([
        { id: 1, code: '110.01', accountName: 'Banco 1', debe: 1000.00, haber: 0.00, isMainAccount: true },
        { id: 2, code: '501.05', accountName: 'Gasto por Servicios', debe: 0.00, haber: 1000.00, isMainAccount: false }
    ]);

    // (Opcional) Estados de control (manteniéndolos por si los necesitas para la lógica de guardado)
    const [isLoading, setIsLoading] = React.useState(false); 
    const [error, setError] = React.useState(null);

    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();

    const handleReturnTransaction = () => {
        // Ejemplo de ruta para volver a la lista de transacciones
        navigate('/bancos/transacciones'); 
    }

    // 🛑 2. ELIMINACIÓN DE handleSearch (es lógica de reporte, no de registro)
    
    // Función para limpiar todos los campos del formulario
    const handleClear = () => {
        setReference('');
        setDate('');
        setDescription('');
        setAccountId('');
        setBalance('');
        setType('');
    };

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

    // Función para AGREGAR (guardar) la nueva transacción
    const handleAdd = async () => {
        // Validación básica de campos requeridos
        if (!accountId || !balance || !type) {
            alert('Por favor, complete al menos la Cuenta, Monto y Tipo.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // Aquí iría tu lógica de POST al API
            console.log('Enviando datos de nueva transacción:', { reference, date, description, accountId, balance, type });
            
            // Simulación de API call exitosa
            // const response = await fetch('/api/banks/transactions', { method: 'POST', body: JSON.stringify({...}) });
            
            alert('Transacción agregada con éxito!');
            handleClear(); // Limpia el formulario
            // navigate('/bancos/transacciones'); // Opcional: Navegar de vuelta a la lista
            
        } catch (err) {
            setError('Error al guardar la transacción.');
        } finally {
            setIsLoading(false);
        }
    };

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
            <h2>Editar Transacción de Banco</h2>
        </div>
        <div className="mb-3">
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i>
                Volver
            </Boton>
        </div>
        {/* Muestra un mensaje de error o carga si es necesario */}
        {error && <div className="alert alert-danger">{error}</div>}
        {isLoading && <div>Cargando...</div>}

        {/* 3. PASAR LAS NUEVAS PROPS AL SCardUtil */}
        <SCardUtil
            // Props de los campos del formulario
            referenceValue={reference} onReferenceChange={setReference}
            dateValue={date} onDateChange={setDate}
            descriptionValue={description} onDescriptionChange={setDescription}

            // Props de Selects
            apiDataAccount={apiDataCuenta} accountValue={accountId} onAccountChange={setAccountId}
            apiDataType={apiDataTipo} typeValue={type} onTypeChange={setType}
            
            // Prop del Monto/Saldo
            balanceValue={balance} onBalanceChange={setBalance}
            
            // Handlers de la Tarjeta
            handleAdd={handleAdd} // El botón "Agregar"
            handleClear={handleClear} // El botón "Limpiar"
            
            // 🛑 NOTA: Se eliminan las props obsoletas: apiDataCodigo, startDate, endDate, handleSearch
        />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3">
            <div className="d-flex gap-2 flex-wrap mb-2 mb-md-0">
                <h3>Detalle de la Transacción</h3>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <Boton color="morado" forma="pastilla" onClick={() => alert('Funcionalidad para Actualizar aún no implementada.')}>
                    Actualizar Transacción
                </Boton>
                <Boton color="morado" forma="pastilla" onClick={() => alert('Funcionalidad para cancelar aún no implementada.')}>
                    Cancelar
                </Boton>
            </div>
        </div>
        <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
                {/* ENCABEZADO: Usamos las columnas definidas + la columna de Acciones */}
                <thead className={styles.table_header}>
                    <tr>
                        {detailColumns.map(col => (
                            <th key={col.header} className={col.className}>{col.header}</th>
                        ))}
                        {/* Se añade el encabezado de "Acciones" manualmente para que la fila total tenga el colspan correcto */}
                        <th className={styles.textAlignCenter}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Filas de DATOS (DocumentTable) */}
                    <DocumentTable
                        documents={transactionDetails}
                        columns={detailColumns}
                        styles={styles} 
                        // Mostrará la columna de Acciones (trash/search) en DocumentTable
                        showRowActions={true} 
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
                        <td></td> 
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    )
}

export default EditBankTransaction;