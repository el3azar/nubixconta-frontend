//imports generales
import React from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { formatDate } from '../../utils/dateFormatter';
//imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { DocumentTable } from '../shared/DocumentTable';
import Boton from '../inventory/inventoryelements/Boton';
import { useNavigate } from "react-router-dom";

// Datos de prueba (QUEMADOS) para la tabla 'Este Módulo' (borrar luego)
const mockBankTransactions = [
    {
        id: 'BTR-001',
        correlative: 1001,
        transactionDate: '2025-10-18T00:00:00Z',
        referenceNumber: 'REF-BANK-54321',
        description: 'Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería Pago a Proveedor A por mercadería',
        amount: 4500.50,
        status: 'PENDIENTE' // Estado para probar la lógica de acciones
    },
    {
        id: 'BTR-002',
        correlative: 1002,
        transactionDate: '2025-10-19T00:00:00Z',
        referenceNumber: 'REF-BANK-54322',
        description: 'Depósito de Cliente Z',
        amount: 875.25,
        status: 'APLICADA' // Estado para probar la lógica de acciones
    },
];
// Datos de prueba (QUEMADOS) para la tabla 'Otros Módulos'
const mockOtherModuleTransactions = [
    {
        id: 'OMT-001',
        correlative: 2001,
        seatNumber: 'ASN-0123',
        transactionDate: '2025-10-15T00:00:00Z',
        originModule: 'Inventario',
        bankAccountName: 'Cuenta Corriente BAC',
        referenceNumber: 'INV-45678',
        description: 'Pago de factura de compra',
        debit: 1200.00,
        credit: 0.00,
    },
    {
        id: 'OMT-002',
        correlative: 2002,
        seatNumber: 'ASN-0124',
        transactionDate: '2025-10-16T00:00:00Z',
        originModule: 'Ventas',
        bankAccountName: 'Cuenta Ahorro Banco X',
        referenceNumber: 'VNT-90123',
        description: 'Cobro de venta de servicios',
        debit: 0.00,
        credit: 350.75,
    },
];

// Columna de Acciones personalizada para 'Este Modulo'
const renderBankActions = (doc, actionProps ) => (
  <div className="d-flex gap-2 justify-content-center flex-wrap">
    <Boton
      color="morado"
      title="Editar"
      onClick={handleEdit}
      size="icon"
    >
      <i className="bi bi-pencil-square"></i>
    </Boton>
    <Boton
      color="verde"
      title="Aplicar"
      onClick={() => console.log("Aplicar:", doc.id)}
      size="icon"
    >
      <i className="bi bi-check-circle"></i>
    </Boton>
    <Boton
      color="rojo"
      title="Eliminar"
      onClick={() => console.log("Eliminar:", doc.id)}
      size="icon"
    >
      <i className="bi bi-trash"></i>
    </Boton>
    <Boton
      color="blanco"
      title="Ver Detalles"
      onClick={handleView}
      size="icon"
    >
      <i className="bi bi-eye"></i>
    </Boton>
  </div>
);

//Columnas de la tabla de este modulo
export const bankTransactionColumns = [
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
        header: 'Estado', // Nueva columna para mostrar el estado
        accessor: 'status', 
        style: { width: '100px', textAlign: 'center' } 
    },
    { 
        header: 'Monto', 
        accessor: 'amount',
        cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
        style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
    },// NOTA: La columna 'Acciones' no se define aquí. Se manejará en el componente DocumentTable.
];
//columnas de la tabla de otros modulos
export const thisModuleColumns = [
    { header: 'Correlativo', accessor: 'correlative', style: { width: '80px', textAlign: 'center' } },
    { header: 'No. de asiento', accessor: 'seatNumber', style: { width: '100px', textAlign: 'center' } }, // Asumiendo 'seatNumber'
    { header: 'Fecha de transacción', accessor: 'transactionDate', cell: (doc) => formatDate(doc.transactionDate), style: { width: '130px' } },
    { header: 'Modulo de origen', accessor: 'originModule', style: { width: '120px' } }, // Asumiendo 'originModule'
    { header: 'Cuenta bancaria', accessor: 'bankAccountName', style: { width: '150px' } },
    { header: 'No. de referencia', accessor: 'referenceNumber', style: { width: '130px', textAlign: 'center' } },
    { header: 'Descripcion de la transaccion', accessor: 'description', style: { flexGrow: 1 } },
    { header: 'Cargo', accessor: 'debit', cell: (doc) => `$${doc.debit ? doc.debit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, // Asumiendo 'debit'
    { header: 'Abono', accessor: 'credit', cell: (doc) => `$${doc.credit ? doc.credit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } }, // Asumiendo 'credit'
];
// Recibe las props del selector para buscar la cuenta bancaria y cualquier otra que necesite la vista
const BankTransactionsView = ({ apiDataCodigo }) => {
    // 1. Definición de ESTADOS FALTANTES e internos
    const [codigoValue, setCodigoValue] = React.useState(''); 
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 2. Estados para la Tabla (Datos, Carga y Error)
    // *** INICIALIZACIÓN CON DATOS QUEMADOS DE 'ESTE_MODULO' ***
    const [transactions, setTransactions] = React.useState(mockBankTransactions);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Define el estado inicial para la tabla
    const [activeModule, setActiveModule] = React.useState('ESTE_MODULO');
    
    // Define las columnas y acciones según el módulo activo
    const isEsteModulo = activeModule === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? bankTransactionColumns : thisModuleColumns;
    const showActions = isEsteModulo; 
    
    const transactionsMapped = transactions.map(doc => ({
    ...doc,
    purchaseStatus: doc.status, // PENDIENTE o APLICADA
    idPurchase: doc.id,         // ID que usa DocumentActions
    }));
    // 3. Lógica de Búsqueda y API
    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setTransactions([]); // Limpia la tabla anterior

        // Lógica de datos quemados para la simulación
        if (codigoValue === 'TEST' && isEsteModulo) {
             // Simulación de carga para datos de prueba
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setTransactions(mockBankTransactions);
            setIsLoading(false);
            return;
        } else if (codigoValue === 'TEST' && !isEsteModulo) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setTransactions(mockOtherModuleTransactions);
            setIsLoading(false);
            return;
        }

        try {
            // Aquí iría tu llamada real a la API (se mantiene como ejemplo)
            const endpoint = isEsteModulo
                ? `/api/banco/transacciones?codigo=${codigoValue}&start=${startDate}&end=${endDate}`
                : `/api/banco/transacciones-otros?codigo=${codigoValue}&start=${startDate}&end=${endDate}`;
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`Error al cargar las transacciones de ${isEsteModulo ? 'bancos' : 'otros módulos'}.`);
            }

            const data = await response.json();
            setTransactions(data);

        } catch (err) {
            // En caso de error real de API, se usa el error
            setError(err);
             // Si hay error, se carga el mock para que el usuario pueda ver algo (Opcional: puedes dejar un array vacío)
             const mockData = isEsteModulo ? mockBankTransactions : mockOtherModuleTransactions;
             // Solo si el código no está vacío, cargamos el mock.
             if (codigoValue) {
                setTransactions(mockData);
             }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCodigoValue(''); // Usamos el setter interno
        setStartDate('');
        setEndDate('');
        setTransactions([]); // Limpiamos la tabla al limpiar filtros
    };

    // Placeholder de funciones de acción (NECESARIO si showActions es true para la tabla)

    // HANDLERS PARA BOTONES DE ACCIÓN Y ORDENAMIENTO
    // Handlers para los botones de la derecha 
    const handleOrderByState = () => console.log('Ordenando por estado...');
    const handleOrderByDate = () => console.log('Ordenando por fecha...');

    //----------------------------------------------------------------------
    // 3. EFECTO PARA RECARGAR DATOS AL CAMBIAR DE MÓDULO O FILTRO
    // ----------------------------------------------------------------------
    React.useEffect(() => {
        // Al cambiar de módulo, cargamos el mock o disparamos la búsqueda
        if (isEsteModulo) {
            setTransactions(mockBankTransactions);
        } else {
            setTransactions(mockOtherModuleTransactions);
        }
        
        // Si ya hay cuenta seleccionada, disparamos la búsqueda de API
        if (codigoValue) {
             handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModule, codigoValue]); // Activa cuando cambian el módulo o la cuenta seleccionada

    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();

    // 2. Definir funciones (handlers) para la navegación
    const handleNew = () => {
        // Ejemplo de ruta para crear una nueva transacción
        navigate('/bancos/nueva'); 
    };
    const handleEdit = () => {
        navigate('/bancos/editar');
    };
    
    const handleView = () => {
        navigate('/bancos/ver'); 
    };

    const handleDelete = (id) => console.log("Eliminar:", id);
    const handleApprove = (id) => console.log("Aprobar:", id);
    const handleCancel = (id) => console.log("Anular:", id);
    const actionsProps = {
        // Funciones requeridas por DocumentActions:
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
        onCancel: handleCancel,
        onView: handleView,
        
        // El renderizador personalizado para sobrescribir la lógica:
        renderActions: renderBankActions, 
        
        // 🛑 CRÍTICO: Incluimos el objeto de clases CSS Modules.
        styles: styles
    };

    return (
        // Usamos el Fragmento (<> </>) como contenedor raíz
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>
                    Gestión de Transacciones Bancarias
                </h2>
            </div>
            
            <SearchCardBank
                apiDataCodigo={apiDataCodigo}
                codigoValue={codigoValue}
                onCodigoChange={setCodigoValue} 
                startDate={startDate}
                onStartDateChange={setStartDate} 
                endDate={endDate}
                onEndDateChange={setEndDate} 
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            {/* BOTONES DE ACCION PARA LA VISUALIZACION DE TABLAS */}
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
                    {/* 1. Botón NUEVA (Solo en 'Este Modulo') */}
                    {isEsteModulo && (
                        <Boton color="morado" forma="pastilla" onClick={handleNew}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Nueva
                        </Boton>
                    )}

                    {/* 2. Botón ORDENAR POR ESTADO (Solo en 'Este Modulo') */}
                    {isEsteModulo && (
                        <Boton color="blanco" forma="pastilla" onClick={handleOrderByState}>
                            Ordenar Por Estado
                        </Boton>
                    )}

                    {/* 3. Botón ORDENAR POR FECHA (En AMBOS módulos) */}
                    <Boton color="blanco" forma="pastilla" onClick={handleOrderByDate}>
                        Ordenar Por Fecha
                    </Boton>
                </div>
            </div>
            {/* Componente de Tabla (Usando el genérico DocumentTable) */}
            {/* TABLA: RENDERIZADO DINÁMICO */}
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}> 
                            {/* Columnas dinámicas */}
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                            {/* Encabezado de Acciones Condicional */}
                            {showActions && <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>} 
                        </tr>
                    </thead>
                    <tbody>
                        {/* Se eliminan las etiquetas <tbody> para que DocumentTable las renderice */}
                        <DocumentTable
                            documents={transactionsMapped}  // <- usa los mocks mapeados
                            columns={currentColumns}
                            showRowActions={showActions}
                            actionsProps={
                                actionsProps
                            }
                            styles={styles}
                            isLoading={isLoading}
                            isError={!!error}
                            error={error}
                            emptyMessage="Utilice el filtro de arriba para buscar transacciones."
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;