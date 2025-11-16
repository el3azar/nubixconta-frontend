import React from 'react';
// Asegúrate de que la ruta al CSS sea correcta
import styles from '../../../../styles/accounting/reportsStyles/contentDiario.module.css';

/**
 * Muestra la tabla formateada del Libro Diario.
 * @param {object} props
 * @param {Array} props.partidas - Array de objetos de partida.
 * @param {object} props.totalesPeriodo - Objeto con total_debe y total_haber del período.
 */
const reportBody = ({ partidas = [], totalesPeriodo }) => {

  // Función para formatear moneda (puedes ajustarla)
  const formatCurrency = (value) => {
    if (value === 0 || !value) return ''; // Devuelve string vacío para 0 o nulo
    
    // Formato USD (Dólares)
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Correlativo</th>
            <th>Descripción / Cuentas</th>
            <th>Debe</th>
            <th>Haber</th>
          </tr>
        </thead>
        <tbody>
          {/* Si no hay partidas, muestra un mensaje */}
          {partidas.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.noDataCell}>
                No se encontraron partidas para el período seleccionado.
              </td>
            </tr>
          ) : (
            // Mapeamos sobre cada partida
            partidas.map((partida) => (
              // Usamos React.Fragment para agrupar las filas de cada partida
              <React.Fragment key={partida.id}> 
                
                {/* Fila 1: Encabezado de la Partida */}
                <tr className={styles.filaHeaderPartida}>
                  <td>{partida.fecha}</td>
                  <td>{partida.id}</td>
                  <td className={styles.descripcionHeader}>
                    {partida.descripcion}
                  </td>
                  <td></td>
                  <td></td>
                </tr>

                {/* Mapeamos sobre los detalles de ESTA partida */}
                {partida.detalles.map((detalle, index) => (
                  <tr key={index} className={styles.filaDetallePartida}>
                    <td></td>
                    <td></td>
                    <td className={styles.cuentaDetalle}>
                      {detalle.codigo} - {detalle.cuenta}
                    </td>
                    <td className={styles.monto}>
                      {formatCurrency(detalle.debe)}
                    </td>
                    <td className={styles.monto}>
                      {formatCurrency(detalle.haber)}
                    </td>
                  </tr>
                ))}

                {/* Fila 3: Totales de la Partida */}
                <tr className={styles.filaTotalPartida}>
                  <td colSpan="3" className={styles.totalPartidaLabel}>
                    <em>Sumas Iguales de la Partida {partida.id}</em>
                  </td>
                  <td className={styles.totalMonto}>
                    {formatCurrency(partida.total_debe)}
                  </td>
                  <td className={styles.totalMonto}>
                    {formatCurrency(partida.total_haber)}
                  </td>
                </tr>

              </React.Fragment>
            ))
          )}

          {/* Fila Final: Totales del Período (solo si hay datos) */}
          {partidas.length > 0 && totalesPeriodo && (
            <tr className={styles.filaTotalPeriodo}>
              <td colSpan="3" className={styles.totalPeriodoLabel}>
                TOTALES DEL PERÍODO
              </td>
              <td className={styles.totalMontoFinal}>
                {formatCurrency(totalesPeriodo.total_debe)}
              </td>
              <td className={styles.totalMontoFinal}>
                {formatCurrency(totalesPeriodo.total_haber)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default reportBody;