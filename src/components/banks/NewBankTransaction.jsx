import React from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
import SCardUtil from './SCardUtil';

const NewBankTransaction = ({ apiDataCuenta, apiDataTipo }) => {

    // 🛑 1. ELIMINACIÓN DE ESTADOS DE BÚSQUEDA Y DEFINICIÓN DE ESTADOS DE FORMULARIO
    
    // Estados del Formulario
    const [reference, setReference] = React.useState('');
    const [date, setDate] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [accountId, setAccountId] = React.useState(''); // Valor del SelectBase para la cuenta
    const [balance, setBalance] = React.useState('');
    const [type, setType] = React.useState(''); // Valor del SelectBase para el tipo (Cargo/Abono)
    
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
                <i className="bi bi-arrow-left me-2"></i>
                Volver
            </Boton>
        </div>
        {/* Muestra un mensaje de error o carga si es necesario */}
        {error && <div className="alert alert-danger">{error}</div>}
        {isLoading && <div>Cargando...</div>}

        {/* 🛑 3. PASAR LAS NUEVAS PROPS AL SCardUtil */}
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
        <h3>Detalle de la Transacción</h3>
        </>
    )
}

export default NewBankTransaction;