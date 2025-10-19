// src/components/banks/BankTransactionFilter.jsx

import React from 'react';
// Importa los estilos de Banks.module.css para las clases específicas
import styles from '../../styles/banks/Banks.module.css'; 
import SelectBase from '../inventory/inventoryelements/SelectBase';

const SearchCardBank = ({
    apiDataCodigo,
    codigoValue,
    onCodigoChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    handleSearch,
    handleClear
}) => {
    return (
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Filtro de Búsqueda</h3>
            
            <div className={styles.searchGrid}>
                {/* CAMPO 1: Cuenta Bancaria */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Cuenta bancaria:</label>
                    <SelectBase
                        apiData={apiDataCodigo}
                        value={codigoValue}
                        onChange={onCodigoChange}
                        placeholder="Buscar código de la cuenta"
                    />
                </div>
                
                {/* Contenedor de Fechas (usa estilos de formulario/grid si searchGrid es el padre) */}
                <div className={`${styles.formGroup} ${styles.fechaGroupWrapper}`}> {/* Puedes añadir una clase extra para estilos de layout */}
                    <div className={styles.buscador}>
                    <div className={styles.fechaGrupo}>
                        <label htmlFor="startDate">Fecha de Inicio:</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.fechaGrupo}>
                        <label htmlFor="endDate">Fecha de Fin:</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                        />
                    </div>
                    </div>
                </div>
                
                {/* Fila de Botones */}
                <div className={`${styles.buttonGroup} mt-3`}>
                    <button className={`${styles.register} me-3`} onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className={`${styles.cancel}`} onClick={handleClear}>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchCardBank;