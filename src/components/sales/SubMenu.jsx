import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/sales/SubMenu.module.css'; // Nuevo archivo

const defaultLinks = [
  { to: '/ventas/clientes', label: 'Clientes' },
  { to: '/ventas/ventas', label: 'Ventas' },
  { to: '/ventas/notas-credito', label: 'Notas de Crédito' },
  { to: '/ventas/reportes', label: 'Reportes' },
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
