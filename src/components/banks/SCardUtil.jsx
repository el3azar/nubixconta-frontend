// src/components/banks/SCardUtil.jsx
import React, { useState, useEffect } from 'react'; // Add useEffect if not already there
import styles from '../../styles/banks/Banks.module.css';
import SelectBase from '../inventory/inventoryelements/SelectBase';
import Boton from '../inventory/inventoryelements/Boton';

const SCardUtil = ({ apiDataAccount, onAddDetail }) => {

    // --- STATES ---
    // Keep idCatalog if you need it elsewhere, but it's less critical now
    // const [idCatalog, setIdCatalog] = useState('');
    
    // 1. NEW STATE: Store the selected account OBJECT
    const [selectedAccount, setSelectedAccount] = useState(null); 
    
    const [description, setDescription] = useState('');
    const [debit, setDebit] = useState('');
    const [credit, setCredit] = useState('');
    // No need for accountName state anymore, we get it from selectedAccount

    // Optional: Clear description/amounts if account changes
    // useEffect(() => {
    //    setDescription('');
    //    setDebit('');
    //    setCredit('');
    // }, [selectedAccount]);

    const handleClear = () => {
        setSelectedAccount(null); // Clear the selected object
        // setIdCatalog('');
        setDescription('');
        setDebit('');
        setCredit('');
    };

    const handleAddClick = () => {
        // --- 3. GET DATA FROM selectedAccount ---
        const catalogIdValue = selectedAccount ? parseInt(selectedAccount.value) : null;
        const accountNameValue = selectedAccount ? selectedAccount.label : '';

        const debitValue = Number(debit) || 0;
        const creditValue = Number(credit) || 0;

        // Validations
        if (!catalogIdValue) { // Check the derived ID
            alert('Por favor, seleccione una cuenta.');
            return;
        }
        // ... (rest of your validations: amount, debit/credit conflict)

        onAddDetail({
            idCatalog: catalogIdValue,
            accountName: accountNameValue, // Use the name from the selected object
            description: description || accountNameValue || 'Detalle de asiento',
            debit: debitValue,
            credit: creditValue,
        });

        // ---  LOG ---
        console.log("Adding Detail:", detailToAdd); 
        // --------------------

        onAddDetail(detailToAdd);

        handleClear();
    };

    const TransFormGroup = styles['trans-form-group'];

    return (
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Añadir Asiento (Línea de Detalle)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr repeat(2, 1fr) auto', gap: '18px', alignItems: 'start' }}>

                {/* --- 2. MODIFY SelectBase --- */}
                <div className={TransFormGroup} style={{ gridColumn: 1 }}>
                    <label className={styles.formLabel}>Cuenta Contable:</label>
                    <SelectBase
                        apiData={apiDataAccount}
                        // Pass the selected OBJECT to value
                        value={selectedAccount} 
                        // onChange receives the selected OBJECT (or null)
                        onChange={(option) => {
                            setSelectedAccount(option); // Store the object
                            // setIdCatalog(option ? option.value : ''); // Update ID if needed
                        }}
                        placeholder="Seleccione una cuenta..."
                    />
                </div>

                {/* ... (rest of your inputs for Description, Debit, Credit) ... */}
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
                        onChange={(e) => setDebit(e.target.value)}
                        disabled={!!credit && parseFloat(credit) > 0} 
                    />
                </div>
                <div className={TransFormGroup} style={{ gridColumn: 4 }}> 
                    <label className={styles.formLabel}>Crédito (Abono):</label>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={credit} 
                        onChange={(e) => setCredit(e.target.value)}
                        disabled={!!debit && parseFloat(debit) > 0} 
                    />
                </div>


                {/* ... (rest of your Buttons) ... */}
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