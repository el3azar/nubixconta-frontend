import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/sales/SubMenu.module.css'; // Nuevo archivo

const defaultLinks = [
  { to: '/inventario/productos', label: 'Productos' },
  { to: '/inventario/moves', label: 'Movimientos de Inventario' },
  { to: '/inventario/movimientosproductos', label: 'Reportes' },
];

const SubMenu = ({ customLinks }) => {
  const location = useLocation();
  const menuLinks = customLinks || defaultLinks;

  return (
    <nav className={styles.subnav}>
      <div className={styles.subnavContainer}>
        {menuLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
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
