import React from 'react';
// Asegúrate de que la ruta al CSS sea correcta
import styles from '../../../../styles/accounting/reportsStyles/firmas.module.css';

/**
 * Componente reutilizable para el pie de firmas de los reportes.
 */
const reportSigns = () => {
  return (
    <section className={styles.firmasContainer}>
      <div className={styles.firmaBloque}>
        <span>_________________________</span>
        <label>Representante Legal</label>
        {/* Puedes añadir más campos si los necesitas */}
      </div>
      <div className={styles.firmaBloque}>
        <span>_________________________</span>
        <label>Contador General</label>
        <span>(JVPC #XXXX)</span>
      </div>
      <div className={styles.firmaBloque}>
        <span>_________________________</span>
        <label>Auditor Externo</label>
        <span>(JVPC #XXXX)</span>
      </div>
    </section>
  );
};

export default reportSigns;