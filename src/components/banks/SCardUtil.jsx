// src/components/banks/SCardUtil.jsx
import React, { useState } from 'react';
import styles from '../../styles/banks/Banks.module.css'; // Asegúrate que la ruta es correcta
import SelectBase from '../inventory/inventoryelements/SelectBase'; // Asegúrate que la ruta es correcta
import Boton from '../inventory/inventoryelements/Boton'; // Asegúrate que la ruta es correcta
import { useCatalogService } from '../../services/accounting/CatalogService'; // Importar el hook, asegúrate que la ruta es correcta

const SCardUtil = ({ onAddDetail }) => { // onAddDetail es la función callback para el padre
    const { searchCatalogs } = useCatalogService(); // Hook para buscar catálogos contables

    const [selectedAccount, setSelectedAccount] = useState(null); // Objeto { value, label } de la cuenta seleccionada
    const [description, setDescription] = useState('');
    const [debit, setDebit] = useState('');
    const [credit, setCredit] = useState('');

    // Limpia los campos del formulario
    const handleClear = () => {
        setSelectedAccount(null);
        setDescription('');
        setDebit('');
        setCredit('');
    };

    // Maneja el clic en el botón "Agregar" para añadir un asiento
    const handleAddClick = () => {
        const catalogIdValue = selectedAccount ? selectedAccount.value : null;
        const accountNameValue = selectedAccount ? selectedAccount.label : '';

        const debitValue = Number(debit) || 0;
        const creditValue = Number(credit) || 0;

        // Validaciones básicas antes de añadir el detalle
        if (!catalogIdValue) {
            alert('Por favor, seleccione una cuenta contable.');
            return;
        }
        if (debitValue === 0 && creditValue === 0) {
            alert('Debe ingresar un valor en Débito o Crédito.');
            return;
        }
        if (debitValue > 0 && creditValue > 0) {
            alert('No puede ingresar valores en Débito y Crédito a la vez.');
            return;
        }

        // Construye el objeto de detalle a añadir
        const detailToAdd = {
            idCatalog: parseInt(catalogIdValue), // Asegura que idCatalog sea un número entero
            accountName: accountNameValue,       // Nombre de la cuenta para mostrar en la tabla
            description: description || accountNameValue || 'Detalle de asiento', // Usa la descripción ingresada o el nombre de la cuenta
            debit: debitValue,
            credit: creditValue,
        };

        console.log("Añadiendo Detalle:", detailToAdd);

        onAddDetail(detailToAdd); // Llama a la función del componente padre para añadir el detalle
        handleClear();             // Limpia el formulario después de añadir
    };

    // Función asíncrona que SelectBase usará para buscar cuentas contables
    const handleSearchAccounts = async (term) => {
        try {
            const results = await searchCatalogs(term); // Llama al servicio real para buscar catálogos
            // Los resultados deben venir en un formato que SelectBase entienda ({ value, label })
            return results;
        } catch (error) {
            console.error("Error en la búsqueda de cuentas en SCardUtil:", error);
            // Si tienes un Notifier, podrías usarlo aquí:
            // Notifier.error("Error al buscar cuentas contables.");
            return []; // Devuelve un array vacío en caso de error
        }
    };

    const TransFormGroup = styles['trans-form-group'];

    return (
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Añadir Asiento (Línea de Detalle)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr repeat(2, 1fr) auto', gap: '18px', alignItems: 'start' }}>

                <div className={TransFormGroup} style={{ gridColumn: 1 }}>
                    <label className={styles.formLabel}>Cuenta Contable:</label>
                    <SelectBase
                        onSearchAsync={handleSearchAccounts} // Prop para la búsqueda asíncrona
                        value={selectedAccount}             // Cuenta seleccionada (objeto { value, label })
                        onChange={setSelectedAccount}       // Actualiza la cuenta seleccionada
                        placeholder="Buscar y seleccionar una cuenta..."
                        minimumInputLength={2}              // Requiere al menos 2 caracteres para buscar
                    />
                </div>

                <div className={TransFormGroup} style={{ gridColumn: 2 }}>
                    <label className={styles.formLabel}>Descripción (Asiento):</label>
                    <input
                        type="text"
                        placeholder="Descripción de la línea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className={TransFormGroup} style={{ gridColumn: 3 }}>
                    <label className={styles.formLabel}>Débito (Cargo):</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={debit}
                        onChange={(e) => {
                            const val = e.target.value;
                            setDebit(val);
                            if (parseFloat(val) > 0) setCredit(''); // Limpia Crédito si se ingresa Débito
                        }}
                    />
                </div>
                <div className={TransFormGroup} style={{ gridColumn: 4 }}>
                    <label className={styles.formLabel}>Crédito (Abono):</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={credit}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCredit(val);
                            if (parseFloat(val) > 0) setDebit(''); // Limpia Débito si se ingresa Crédito
                        }}
                    />
                </div>

                <div style={{ gridColumn: 5, alignSelf: 'end', display: 'flex', gap: '8px', paddingBottom: '5px' }}>
                    <Boton color="morado" forma="pastilla" onClick={handleAddClick}>
                        <i className="bi bi-plus me-2"></i> Agregar
                    </Boton>
                    <Boton color="blanco" forma="pastilla" onClick={handleClear}>
                        Limpiar
                    </Boton>
                </div>

            </div>
        </div>
    );
};

export default SCardUtil;