// src/components/banks/SearchCardBank.jsx
import React from 'react';
import styles from '../../styles/banks/Banks.module.css';
import Boton from '../inventory/inventoryelements/Boton';

/**
 * Componente de filtros de búsqueda. Simplificado para usar un input de texto para la cuenta bancaria.
 *
 * @param {string} accountName - Valor del campo de nombre de cuenta.
 * @param {Function} onAccountNameChange - Handler para cambios en el nombre de la cuenta.
 * @param {string} startDate - Valor de la fecha de inicio.
 * @param {Function} onStartDateChange - Handler para cambios en la fecha de inicio.
 * @param {string} endDate - Valor de la fecha de fin.
 * @param {Function} onEndDateChange - Handler para cambios en la fecha de fin.
 * @param {Function} handleSearch - Función para el botón "Buscar".
 * @param {Function} handleClear - Función para el botón "Limpiar".
 */
const SearchCardBank = ({
    accountName,
    onAccountNameChange,
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
                {/* --- CAMPO SIMPLIFICADO --- */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="accountNameInput">Cuenta bancaria:</label>
                    <input
                        id="accountNameInput"
                        type="text"
                        // Recomiendo crear una clase para inputs en tu CSS module, ej: styles.textInput
                        className="form-control" // Usando una clase de Bootstrap como ejemplo
                        value={accountName}
                        onChange={(e) => onAccountNameChange(e.target.value)}
                        placeholder="Buscar por nombre de la cuenta"
                    />
                </div>

                {/* Contenedor de Fechas (sin cambios) */}
                <div className={`${styles.formGroup} ${styles.fechaGroupWrapper}`}>
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

                {/* Fila de Botones (sin cambios) */}
                <div className={`${styles.buttonGroup} mt-3`}>
                    <Boton color="morado" forma="pastilla" onClick={handleSearch} className="me-3">
                        Buscar
                    </Boton>
                    <Boton color="blanco" forma="pastilla" onClick={handleClear}>
                        Limpiar
                    </Boton>
                </div>
            </div>
        </div>
    );
};

export default SearchCardBank;