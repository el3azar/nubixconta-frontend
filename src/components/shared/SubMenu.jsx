// src/components/shared/SubMenu.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Es buena práctica mover el CSS a una ubicación compartida si el componente lo es.
// Si lo dejas donde está, ajusta la ruta.
import styles from '../../styles/shared/SubMenu.module.css'; 

/**
 * Componente de Sub-navegación reutilizable.
 * @param {Array<Object>} links - Un array de objetos de enlace.
 * @param {string} links[].to - La ruta del enlace (ej. '/ventas/clientes').
 * @param {string} links[].label - El texto a mostrar en el botón.
 */
const SubMenu = ({ links = [] }) => { // Recibe 'links' como prop y por defecto es un array vacío.
  const location = useLocation();

  return (
    <nav className={styles.subnav}>
      <div className={styles.subnavContainer}>
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            // La lógica para determinar la clase activa se mantiene, es perfecta.
            className={
              location.pathname.startsWith(link.to)
                ? `${styles.subnavBtn} ${styles.active}`
                : styles.subnavBtn
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SubMenu;