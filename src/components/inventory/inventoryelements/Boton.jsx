import React from 'react';
import styles from '../../../styles/inventory/Boton.module.css'; // Importamos los estilos del módulo
//import './Boton.css'; // Importamos los estilos del componente

/**
 * Componente de botón personalizable.
 * @param {object} props
 * @param {'morado' | 'blanco'} [props.color='morado'] - El esquema de color del botón.
 * @param {'pastilla' | 'grande'} props.forma - La forma del redondeo del botón.
 * @param {function} props.onClick - La función a ejecutar cuando se hace clic.
 * @param {React.ReactNode} props.children - El contenido del botón (el texto).
 */
function Boton({ children, color = 'morado', forma, onClick, className = '',size, ...otrosProps }) {

  // 1. Construimos la lista de clases dinámicamente
  const clases = ['btn']; // Clase base de Bootstrap

  // 2. Añadimos la clase de color desde nuestro módulo de CSS
  if (color === 'morado') {
    clases.push(styles.btnCustomMorado);
  } else if (color === 'blanco') {
    clases.push(styles.btnCustomBlanco);
  } else if (color === 'verde') { // Añadimos soporte para nuevos colores si es necesario
    clases.push(styles.btnCustomVerde);
  } else if (color === 'rojo') {
    clases.push(styles.btnCustomRojo);
  }

  // 3. Añadimos la clase de forma de Bootstrap
  if (forma === 'pastilla') {
    clases.push('rounded-pill');
  } else if (forma === 'grande') {
    clases.push('rounded-4');
  }
 // --- ¡ESTA ES LA LÓGICA NUEVA Y CLAVE! ---
  // Si la prop 'size' es 'icon', añadimos la clase específica.
  if (size === 'icon') {
    clases.push(styles.btnIconOnly);
  }
  // --- FIN DE LA LÓGICA NUEVA ---
  // 2. Añade la clase externa a la lista
  if (className) {
    clases.push(className);
  }

  // El operador "..." pasa cualquier otra prop (como type="submit") al botón
  return (
    <button 
      className={clases.join(' ')} 
      onClick={onClick} 
      {...otrosProps}
    >
      {children}
    </button>
  );
}

export default Boton;