import React from 'react';
import styles from '../../styles/banks/Banks.module.css';
import Boton from '../inventory/inventoryelements/Boton';


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

            {/* El contenedor .searchGrid ahora apila los elementos verticalmente */}
            <div className={styles.searchGrid}>
                
                {/* --- CAMPO DE CUENTA (PRIMER ELEMENTO EN LA COLUMNA) --- */}
                {/* Usamos la clase .accountInputGroup para controlar su ancho y que no ocupe toda la tarjeta */}
                <div className={`${styles.formGroup} ${styles.accountInputGroup}`}>
                    <label className={styles.formLabel} htmlFor="accountNameInput">Cuenta bancaria:</label>
                    <input
                        id="accountNameInput"
                        type="text"
                        className="form-control"
                        value={accountName}
                        onChange={(e) => onAccountNameChange(e.target.value)}
                        placeholder="Buscar por nombre de la cuenta"
                    />
                </div>

                {/* --- CONTENEDOR DE FECHAS (SEGUNDO ELEMENTO EN LA COLUMNA) --- */}
                {/* El div .buscador interno mantiene las fechas una al lado de la otra */}
                <div className={styles.formGroup}>
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

                {/* --- FILA DE BOTONES (ÚLTIMO ELEMENTO EN LA COLUMNA) --- */}
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