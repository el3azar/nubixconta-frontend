// src/components/banks/SCardUtil.jsx
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async'; // 1. CAMBIO: Usamos AsyncSelect directamente
import styles from '../../styles/banks/Banks.module.css';
import Boton from '../inventory/inventoryelements/Boton';
import { useCatalogService } from '../../services/accounting/CatalogService';

const SCardUtil = ({ onAddDetail }) => {
    const { searchCatalogs } = useCatalogService();

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [description, setDescription] = useState('');
    const [debit, setDebit] = useState('');
    const [credit, setCredit] = useState('');

    const handleClear = () => {
        setSelectedAccount(null);
        setDescription('');
        setDebit('');
        setCredit('');
    };

    const handleAddClick = () => {
        // La validación ahora usa los datos completos del objeto selectedAccount
        if (!selectedAccount) {
            alert('Por favor, seleccione una cuenta contable.');
            return;
        }
        const debitValue = Number(debit) || 0;
        const creditValue = Number(credit) || 0;

        if (debitValue === 0 && creditValue === 0) {
            alert('Debe ingresar un valor en Débito o Crédito.');
            return;
        }

        const detailToAdd = {
            idCatalog: selectedAccount.value, // Usamos 'value' que contiene el ID
            accountName: selectedAccount.name, // Usamos 'name' que pasamos en el mapeo
            description: description || selectedAccount.name,
            debit: debitValue,
            credit: creditValue,
        };

        onAddDetail(detailToAdd);
        handleClear();
    };

    // 2. CORRECCIÓN: Esta es la función clave. Ahora mapea los resultados.
    const loadAccountOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) return [];
        try {
            const accounts = await searchCatalogs(inputValue);
            // Mapeamos los resultados al formato { value, label } que AsyncSelect necesita
            return accounts.map(acc => ({
                value: acc.id,
                label: `${acc.accountCode} - ${acc.accountName}`,
                // También puedes pasar datos adicionales para usarlos después
                code: acc.accountCode,
                name: acc.accountName,
            }));
        } catch (error) {
            console.error("Error buscando cuentas", error);
            return [];
        }
    };

    const TransFormGroup = styles['trans-form-group'];

    return (
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Añadir Asiento (Línea de Detalle)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr repeat(2, 1fr) auto', gap: '18px', alignItems: 'flex-end' }}>

                <div className={TransFormGroup} style={{ gridColumn: 1 }}>
                    <label className={styles.formLabel}>Cuenta Contable:</label>
                    {/* 3. CAMBIO: Reemplazamos SelectBase por AsyncSelect con sus props estándar */}
                    <AsyncSelect
                        key={selectedAccount ? selectedAccount.value : 'acct-select'}
                        cacheOptions
                        defaultOptions
                        loadOptions={loadAccountOptions} // Prop para la búsqueda asíncrona
                        value={selectedAccount}
                        onChange={setSelectedAccount}
                        placeholder="Buscar por código o nombre..."
                        isClearable
                    />
                </div>

                <div className={TransFormGroup} style={{ gridColumn: 2 }}>
                    <label className={styles.formLabel}>Descripción (Asiento):</label>
                    <input
                        type="text"
                        placeholder="Descripción de la línea"
                        className={styles.formInput} // Añadí una clase para consistencia
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className={TransFormGroup} style={{ gridColumn: 3 }}>
                    <label className={styles.formLabel}>Débito (Cargo):</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        className={styles.formInput} // Añadí una clase para consistencia
                        value={debit}
                        onChange={(e) => {
                            setDebit(e.target.value);
                            if (parseFloat(e.target.value) > 0) setCredit('');
                        }}
                    />
                </div>
                <div className={TransFormGroup} style={{ gridColumn: 4 }}>
                    <label className={styles.formLabel}>Crédito (Abono):</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        className={styles.formInput} // Añadí una clase para consistencia
                        value={credit}
                        onChange={(e) => {
                            setCredit(e.target.value);
                            if (parseFloat(e.target.value) > 0) setDebit('');
                        }}
                    />
                </div>

                <div style={{ gridColumn: 5, display: 'flex', gap: '8px' }}>
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