import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Sidebar.module.css'; // Importa el CSS Module
import { Link, useLocation } from "react-router-dom";
import { House, PersonLinesFill, PeopleFill, BoxSeam, List } from 'react-bootstrap-icons';

const SideBar = ({ sidebarOpen, toggleSidebar }) => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Overlay en móvil/tablet */}
      <div className={`${styles.sidebarOverlay} d-md-none`} style={{ display: sidebarOpen ? 'block' : 'none' }}
        onClick={toggleSidebar} />
      {/* Sidebar principal */}
      <aside  className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed} text-white position-relative`}
        aria-label="Menú lateral principal"
      >
        {/* Encabezado del menú */}
        <header className={styles.sidebarHeader}>
          {sidebarOpen && (
            <span className={styles.sidebarLogo}>
              NUBIXCONTA
            </span>
          )}
          <button className={`btn btn-link btn-sm text-white ms-auto ${styles.sidebarToggleBtn}`}
            onClick={toggleSidebar} aria-label="Mostrar/ocultar menú lateral"
          >
            <List size={28} />
          </button>
        </header>
        {/* Navegación principal */}
        <nav className={styles.sidebarNav} aria-label="Secciones principales">
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <Link  to="/ventas"  className={`nav-link ${styles.menuLink} d-flex align-items-center ${pathname === "/ventas" ? styles.active : "text-white"}`}>
                <House className="me-2" size={20} />
                <span className={sidebarOpen ? 'd-inline' : styles.menuLabelHidden}>Ventas</span>
              </Link>
            </li>
            <li>
              <Link to="/cuentas"
                className={`nav-link ${styles.menuLink} d-flex align-items-center ${pathname === "/cuentas" ? styles.active : "text-white"}`}
              >
                <PersonLinesFill className="me-2" size={20} />
                <span className={sidebarOpen ? 'd-inline' : styles.menuLabelHidden}>Cuentas por Cobrar</span>
              </Link>
            </li>
            <li>
              <Link to="/admin"  className={`nav-link ${styles.menuLink} d-flex align-items-center ${pathname === "/admin" ? styles.active : "text-white"}`}
              >
                <PeopleFill className="me-2" size={20} />
                <span className={sidebarOpen ? 'd-inline' : styles.menuLabelHidden}>Administración</span>
              </Link>
            </li>
            <li>
              <Link  to="/inventario"
                className={`nav-link ${styles.menuLink} d-flex align-items-center ${pathname === "/inventario" ? styles.active : "text-white"}`}
              >
                <BoxSeam className="me-2" size={20} />
                <span className={sidebarOpen ? 'd-inline' : styles.menuLabelHidden}>Inventario</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
