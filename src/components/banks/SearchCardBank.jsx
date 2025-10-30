// src/components/banks/SearchCardBank.jsx
import React from 'react';
import styles from '../../styles/banks/Banks.module.css'; 
import SelectBase from '../inventory/inventoryelements/SelectBase';
import Boton from '../inventory/inventoryelements/Boton'; // Asegúrate de que Boton esté importado

/**
 * Componente reutilizable para la tarjeta de filtros de búsqueda.
 * @param {Array} apiDataCodigo - Datos para el Select de "Cuenta bancaria".
 * @param {string} codigoValue - Valor actual del Select de cuenta (idCatalog).
 * @param {Function} onCodigoChange - Handler para cambios en el Select de cuenta.
 * @param {string} startDate - Valor actual de la fecha de inicio (YYYY-MM-DD).
 * @param {Function} onStartDateChange - Handler para cambios en la fecha de inicio.
 * @param {string} endDate - Valor actual de la fecha de fin (YYYY-MM-DD).
 * @param {Function} onEndDateChange - Handler para cambios en la fecha de fin.
 * @param {Function} handleSearch - Función a llamar al presionar "Buscar".
 * @param {Function} handleClear - Función a llamar al presionar "Limpiar".
 */
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
                {/* CAMPO 1: Cuenta Bancaria (idCatalog) */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Cuenta bancaria:</label>
                    <SelectBase
                        apiData={apiDataCodigo}
                        value={codigoValue}
                        onChange={onCodigoChange} // Asumiendo que SelectBase devuelve el 'value'
                        placeholder="Buscar código de la cuenta"
                    />
                </div>
                
                {/* Contenedor de Fechas (dateFrom y dateTo) */}
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
                
                {/* Fila de Botones */}
                <div className={`${styles.buttonGroup} mt-3`}>
                    {/* Reemplazando <button> por <Boton> para consistencia */}
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