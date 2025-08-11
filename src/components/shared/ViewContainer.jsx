import React from 'react';
// Reutilizamos los estilos que ya definimos en mainLayout.module.css
import styles from '../../styles/mainLayout.module.css'; 

/**
 * Componente contenedor estándar para todas las vistas principales.
 * Proporciona un ancho máximo en pantallas grandes y centra el contenido.
 * Recibe un título opcional para mostrarlo de forma consistente.
 */
const ViewContainer = ({ children, title }) => {
  return (
    // Aplicamos el estilo .viewWrapper que definimos para centrar y limitar el ancho.
    <div className={styles.viewWrapper}>
      {/* Si se proporciona un título, lo renderiza como un h1 estándar */}
      {title && <h1 className="mb-4 text-center text-black">{title}</h1>}
      {children}
    </div>
  );
};

export default ViewContainer;