// src/components/banks/SCardUtil.jsx
import React, { useState } from 'react'; // Elimina useEffect si no lo usas
import styles from '../../styles/banks/Banks.module.css';
import SelectBase from '../inventory/inventoryelements/SelectBase';
import Boton from '../inventory/inventoryelements/Boton';
import { useCatalogService } from '../../services/accounting/CatalogService'; // Importar el hook

const SCardUtil = ({ onAddDetail }) => { // Ya no necesitas apiDataAccount aquí
    const { searchCatalogs } = useCatalogService(); // Usar el servicio de catálogos

    const [selectedAccount, setSelectedAccount] = useState(null); // Objeto { value, label }
    const [description, setDescription] = useState('');
    const [debit, setDebit] = useState('');
    const [credit, setCredit] = useState('');

    const handleClear = () => {
        setSelectedAccount(null);
        setDescription('');
        setDebit('');
        setCredit('');
        // No hay necesidad de limpiar searchResults aquí, ya que SelectBase no las maneja directamente como estado.
    };

    const handleAddClick = () => {
        const catalogIdValue = selectedAccount ? selectedAccount.value : null;
        const accountNameValue = selectedAccount ? selectedAccount.label : '';

        const debitValue = Number(debit) || 0;
        const creditValue = Number(credit) || 0;

        // Validaciones
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

        const detailToAdd = {
            idCatalog: parseInt(catalogIdValue), // Convertir a número si el backend lo espera como int
            accountName: accountNameValue, // Usar el label del objeto seleccionado
            description: description || accountNameValue || 'Detalle de asiento',
            debit: debitValue,
            credit: creditValue,
        };

        console.log("Añadiendo Detalle:", detailToAdd);

        onAddDetail(detailToAdd); // Llamar a la función del padre
        handleClear(); // Limpiar el formulario después de añadir
    };

    // Esta es la función que SCardUtil le pasará a SelectBase como onSearchAsync
    // SelectBase la llamará cada vez que el usuario escriba en el input.
    const handleSearchAccounts = async (term) => {
        // Puedes añadir una longitud mínima de búsqueda aquí también si quieres
        // if (term.length < 2) return [];

        try {
            const results = await searchCatalogs(term); // Llama a tu servicio real
            return results; // Retorna los resultados en el formato {value, label}
        } catch (error) {
            console.error("Error en la búsqueda de cuentas en SCardUtil:", error);
            // Puedes usar Notifier.error aquí si quieres mostrar un mensaje al usuario
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
                        // Ahora le pasamos la función onSearchAsync
                        onSearchAsync={handleSearchAccounts}
                        value={selectedAccount} // Pasa el objeto seleccionado
                        onChange={setSelectedAccount} // Actualiza el objeto seleccionado
                        placeholder="Buscar y seleccionar una cuenta..."
                        minimumInputLength={2} // Ejemplo: Requiere al menos 2 caracteres para buscar
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
                            if (parseFloat(val) > 0) setCredit(''); // Si hay débito, limpiar crédito
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
                            if (parseFloat(val) > 0) setDebit(''); // Si hay crédito, limpiar débito
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