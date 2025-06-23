import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Sidebar.module.css'; // Importa el CSS Module
import { useLocation, Link, useNavigate } from "react-router-dom";
import { House, PersonLinesFill, PeopleFill, BoxSeam, List } from 'react-bootstrap-icons';
import { BoxArrowRight } from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";


const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: House },
  { to: "/admin/usuarios", label: "Usuarios", icon: PeopleFill },
  { to: "/admin/empresas", label: "Empresas", icon: PersonLinesFill },
  { to: "/admin/bitacora-cambios", label: "Bitácora de cambios", icon: List },
  { to: "/admin/bitacora-accesos", label: "Bitácora de accesos", icon: BoxSeam },
];

const moduleLinks = [
  { to: "/ventas", label: "Ventas", icon: House },
  { to: "/cuentas", label: "Cuentas por Cobrar", icon: PersonLinesFill },
  { to: "/inventario", label: "Inventario", icon: BoxSeam },
  { to: "/admin", label: "Administración", icon: PeopleFill }, // Solo para admin
];

const SideBar = ({ sidebarOpen, toggleSidebar }) => {
  const { pathname } = useLocation();
  const { role, logout } = useAuth(); 
  const navigate = useNavigate();
// Define si estamos en sección admin
  const isAdminRoute = pathname.startsWith("/admin");
  // Filtra 'Administración' en sidebar si el usuario no es admin
 const filteredModuleLinks = role === true
  ? moduleLinks
  : moduleLinks.filter(link => link.to !== "/admin");

  const linksToShow = isAdminRoute ? adminLinks : filteredModuleLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
            {linksToShow.map(({ to, label, icon: Icon }, i) => (
              <li key={i} className="nav-item">
                <Link to={to} className={`nav-link ${styles.menuLink} d-flex align-items-center ${pathname === to ? styles.active : "text-white"}`}>
                  <Icon className="me-2" size={20} />
                  <span className={sidebarOpen ? 'd-inline' : styles.menuLabelHidden}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botón Cerrar sesión pegado abajo */}
      <div className="mt-auto w-100">
        <button
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          style={{ marginBottom: '1rem', minHeight: 48 }}
          onClick={handleLogout} title="Cerrar sesión">
            
          <BoxArrowRight size={20} className="me-2" />
          {sidebarOpen && "Cerrar sesión"}
        </button>
    </div>

      </aside>
    </>
  );
};

export default SideBar;
