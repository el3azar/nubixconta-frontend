import React from 'react';
import styles from '../../styles/banks/Banks.module.css'; 
import SelectBase from '../inventory/inventoryelements/SelectBase';
import Boton from '../inventory/inventoryelements/Boton'; // Se asume que Boton está disponible

// 🛑 Las props se redefinen para reflejar el formulario de registro/edición
const SCardUtil = ({
    // Campos de entrada (inputs)
    referenceValue, onReferenceChange,
    dateValue, onDateChange,
    descriptionValue, onDescriptionChange,
    balanceValue, onBalanceChange,
    
    // Selects (Cuenta y Tipo)
    apiDataAccount, accountValue, onAccountChange, // apiDataAccount reemplaza apiDataCodigo
    apiDataType, typeValue, onTypeChange,

    // Handlers
    handleAdd, // Para el botón "Agregar"
    handleClear // Para el botón "Limpiar"
    
    // NOTA: Las props de búsqueda como handleSearch y startDate/endDate se eliminan
}) => {
    // 🛑 Datos Mock para los campos informativos (Código y Nombre), asumiendo que vienen de la selección de accountValue
    // En una aplicación real, usarías useEffect y una búsqueda para obtener estos datos
    const mockAccountInfo = { 
        codigo: 'Ejemplo: C-98765', 
        nombre: 'Ejemplo: Cuenta Corriente Principal' 
    };
    // Usamos la sintaxis con corchetes para la clase con guion
    const TransFormGroup = styles['trans-form-group'];

    return (
        <div className={styles.searchCard}>
            <h3 className={styles.h2Izq}>Detalles de la Transacción</h3> 
            
            <div style={{ 
                display: 'grid', 
                // 4 columnas: 3 de contenido (1fr) + 1 para botones (auto)
                gridTemplateColumns: 'repeat(3, 1fr) auto', 
                // 3 filas de altura automática para los grupos de formulario
                gridTemplateRows: 'auto auto auto',
                gap: '18px', // Aumentamos el gap a 18px para un mejor espaciado
                alignItems: 'start' // Alinea el contenido al inicio de cada fila
            }}>
                
                {/* --------------------- PRIMERA FILA (grid-row: 1) --------------------- */}
                
                {/* 1. No. de Referencia (Col 1, Fila 1) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 1, gridRow: 1 }}> 
                    <label className={styles.formLabel}>No. de Referencia:</label>
                    <input type="text" placeholder="Número de comprobante" value={referenceValue} onChange={(e) => onReferenceChange(e.target.value)}/>
                </div>
                
                {/* 2. Fecha (Col 2, Fila 1) - USA styles.fechaGrupo y POSICIÓN EXPLÍCITA */}
                <div className={styles.fechaGrupo} style={{ gridColumn: 2, gridRow: 1 }}>
                    <label className={styles.formLabel}>Fecha:</label>
                    <input type="date" value={dateValue} onChange={(e) => onDateChange(e.target.value)}/>
                </div>
                
                {/* 3. Descripción (Col 3, Fila 1) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 3, gridRow: 1 }}> 
                    <label className={styles.formLabel}>Descripción:</label>
                    <input type="text" placeholder="Descripción de la transacción" value={descriptionValue} onChange={(e) => onDescriptionChange(e.target.value)}/>
                </div>

                {/* --------------------- SEGUNDA FILA (grid-row: 2) --------------------- */}
                
                {/* 4. Buscar Cuenta (Col 1, Fila 2) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 1, gridRow: 2 }}>
                    <label className={styles.formLabel}>Buscar Cuenta:</label>
                    <SelectBase apiData={apiDataAccount} value={accountValue} onChange={onAccountChange} placeholder="Seleccione una cuenta..."/>
                </div>

                {/* 5. Monto/Saldo (Col 2, Fila 2) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 2, gridRow: 2 }}>
                    <label className={styles.formLabel}>Monto/Saldo:</label>
                    <input type="number" placeholder="Monto (en números)" value={balanceValue} onChange={(e) => onBalanceChange(e.target.value)}/>
                </div>

                {/* 6. Tipo (Col 3, Fila 2) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 3, gridRow: 2 }}>
                    <label className={styles.formLabel}>Tipo:</label>
                    <SelectBase apiData={apiDataType} value={typeValue} onChange={onTypeChange} placeholder="Seleccione..."/>
                </div>

                {/* --------------------- TERCERA FILA (grid-row: 3) --------------------- */}

                {/* 8. Código (Informativo) (Col 1, Fila 3) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 1, gridRow: 3 }}>
                    <label className={styles.formLabel}>Código:</label>
                    <input type="text" placeholder="Código de la cuenta" value={mockAccountInfo.codigo} disabled />
                </div>

                {/* 9. Nombre (Informativo) (Col 2, Fila 3) - USA CLASE NUEVA Y POSICIÓN EXPLÍCITA */}
                <div className={TransFormGroup} style={{ gridColumn: 2, gridRow: 3 }}>
                    <label className={styles.formLabel}>Nombre:</label>
                    <input type="text" placeholder="Nombre de la cuenta" value={mockAccountInfo.nombre} disabled />
                </div>
                
                {/* 7. Columna de Botones (Col 4, Ocupa Fila 1 y 2) - POSICIÓN EXPLÍCITA */}
                <div style={{ 
                    gridColumn: 3, 
                    gridRow: '3 / span 4', // Se extiende desde la Fila 1 hasta la Fila 2
                    alignSelf: 'start', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    paddingTop: '30px' // Ajuste visual si la Fila 1/2 es demasiado alta
                }}>
                    <Boton color="morado" forma="pastilla" onClick={handleAdd}>
                        <i className="bi bi-plus me-2"></i> Agregar
                    </Boton>
                    <Boton color="blanco" forma="pastilla" onClick={handleClear}>
                        Limpiar
                    </Boton>
                </div>


                {/* 🛑 Se eliminan los DIVs de espacio vacío y los estilos redundantes. */}
                
            </div>
        </div>
    );
};

export default SCardUtil;