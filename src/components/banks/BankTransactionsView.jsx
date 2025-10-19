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

export const bankTransactionColumns = [
    { 
        header: 'Correlativo', 
        // Asumiendo que existe una propiedad correlativo en el objeto de la API
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
        header: 'Monto', 
        accessor: 'amount',
        // Ejemplo de formato de moneda: $1,234.56
        cell: (doc) => `$${doc.amount ? doc.amount.toFixed(2) : '0.00'}`,
        style: { width: '120px', textAlign: 'right', fontWeight: 'bold' } 
    },
    // NOTA: La columna 'Acciones' no se define aquí. 
    // Se habilita pasando 'showRowActions={true}' al componente DocumentTable.
];

// Recibe las props del selector para buscar la cuenta bancaria y cualquier otra que necesite la vista
const BankTransactionsView = ({ apiDataCodigo }) => {
    // 1. Definición de ESTADOS FALTANTES e internos
    const [codigoValue, setCodigoValue] = React.useState(''); // ESTE ES EL ESTADO FALTANTE
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 2. Estados para la Tabla (Datos, Carga y Error)
    const [transactions, setTransactions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    // ...

    // 3. Lógica de Búsqueda y API
    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setTransactions([]); // Limpia la tabla anterior

        try {
            // Aquí iría tu llamada real a la API, usando el estado
            // Ejemplo de endpoint: /api/bancos/transacciones?cuenta=X&inicio=Y&fin=Z
            const response = await fetch(`/api/banco/transacciones?codigo=${codigoValue}&start=${startDate}&end=${endDate}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar las transacciones.');
            }

            const data = await response.json();
            setTransactions(data);

        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setCodigoValue(''); // Usamos el setter interno
        setStartDate('');
        setEndDate('');
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
                onCodigoChange={setCodigoValue} // Pasa el setter directamente
                startDate={startDate}
                onStartDateChange={setStartDate} // Pasa el setter
                endDate={endDate}
                onEndDateChange={setEndDate} // Pasa el setter
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            {/* BOTONES DE ACCION PARA LA VISUAIZACION DE TABLAS */}
 {/* Los botones de acción son específicos de esta vista */}
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
            {/* Lado Izquierdo: Nuevos botones de filtro por origen */}
            <div className="d-flex gap-2 flex-wrap">
                <Boton color="blanco" forma="pastilla" onClick="submit">
                Este Modulo
                </Boton>
                <Boton color="blanco" forma="pastilla" onClick="submit">
                Otros Modulos
                </Boton>
            </div>
    
            {/* Lado Derecho: Botones de generación de reportes */}
            <div className="d-flex gap-2 flex-wrap">
                <Boton color="morado" forma="pastilla" onClick="submit">
                Ordenar Por Estado
                </Boton>
                <Boton color="morado" forma="pastilla" onClick="submit">
                Ordenar Por Fecha
                </Boton>
            </div>
            </div>
            {/* Componente de Tabla (Usando el genérico DocumentTable) */}
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}> 
                            {bankTransactionColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTable
                            documents={transactions}
                            columns={bankTransactionColumns}
                            isLoading={isLoading}
                            isError={!!error}
                            error={error}
                            // HABILITA LA COLUMNA DE ACCIONES
                            showRowActions={true} 
                            emptyMessage="Utilice el filtro de arriba para buscar transacciones."
                            // actionsProps: NECESITARÁS pasar aquí las funciones para cada acción (ver, editar, eliminar, etc.)
                            // actionsProps={{ onView: handleView, onDelete: handleDelete, ... }}
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankTransactionsView;