import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Sidebar.module.css'; // Importa el CSS Module
import { useLocation, Link, useNavigate } from "react-router-dom";
import { House, PersonLinesFill, PeopleFill, BoxSeam, List, ArrowLeftRight, JournalRichtext, Cart4,CashCoin,Bank2,Calculator} from 'react-bootstrap-icons';
import { BoxArrowRight } from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";



const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: House },
  { to: "/admin/usuarios", label: "Usuarios", icon: PeopleFill },
  { to: "/admin/empresas", label: "Empresas", icon: PersonLinesFill },
  { to: "/admin/bitacora-cambios", label: "Bitácora de cambios", icon: List },
  { to: "/admin/bitacora-accesos", label: "Bitácora de accesos", icon: BoxSeam },
  { to: "/admin/empresas-contabilidad", label: "Contabilidad", icon: JournalRichtext },
];

const moduleLinks = [
  { to: "/ventas", label: "Ventas", icon: House },
  { to: "/cuentas", label: "Cuentas por Cobrar", icon: PersonLinesFill },
  { to: "/inventario", label: "Inventario", icon: BoxSeam },
  { to: "/compras", label: "Compras", icon: Cart4 },
  { to: "/cuentas-por-pagar", label: "Cuentas por Pagar", icon: CashCoin },
  { to: "/bancos", label: "Bancos", icon: Bank2 },
  { to: "/contabilidad", label: "Contabilidad", icon: Calculator },
  { to: "/admin", label: "Administración", icon: PeopleFill, adminOnly: true }, // Solo para admin
];

const SideBar = ({ sidebarOpen, toggleSidebar }) => {
  const { pathname } = useLocation();
  const { role, logout } = useAuth(); 
  const navigate = useNavigate();
  const isAdminRoute = pathname.startsWith("/admin");
  // La lógica de filtrado ahora puede ser más explícita
  const filteredModuleLinks = role === true 
    ? moduleLinks 
    : moduleLinks.filter(link => !link.adminOnly);
  const linksToShow = isAdminRoute ? adminLinks : filteredModuleLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`} aria-label="Menú lateral principal">
      <header className={styles.sidebarHeader}>
        {/* 1. Envolvemos el span del logo con un componente Link de React Router. */}
        <Link to="/home" className={styles.sidebarLogoLink}>
          {/* 2. El span ahora vive dentro del Link. */}
          <span className={styles.sidebarLogo}>NUBIXCONTA</span>
        </Link>
        <button className={`btn btn-link btn-sm text-white ${styles.sidebarToggleBtn}`} onClick={toggleSidebar} aria-label="Mostrar/ocultar menú lateral">
          <List size={28} />
        </button>
      </header>

      <nav className={styles.sidebarNav}>
        <ul className="nav nav-pills flex-column mb-auto">
          {linksToShow.map(({ to, label, icon: Icon }, i) => (
            <li key={i} className="nav-item">
              <Link to={to} className={`nav-link ${styles.menuLink} ${pathname === to ? styles.active : "text-white"}`} title={label}>
                <Icon className={styles.menuIcon} size={20} />
                <span className={styles.menuLabel}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto w-100 p-2">
        {!isAdminRoute && (
          <Link to="/empresas"  className={`btn btn-outline-light w-100 d-flex align-items-center justify-content-center ${styles.bottomBtn}`} title="Cambiar de Empresa">
            <ArrowLeftRight className={styles.menuIcon} size={20} />
            <span className={styles.menuLabel}>Cambiar Empresa</span>
          </Link>
        )}
        <button className={`btn btn-outline-light w-100 d-flex align-items-center justify-content-center mt-2 ${styles.bottomBtn}`} onClick={handleLogout} title="Cerrar sesión">
          <BoxArrowRight className={styles.menuIcon} size={20} />
          <span className={styles.menuLabel}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;