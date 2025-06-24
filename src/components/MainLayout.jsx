import { useState, useEffect } from "react";
import SideBar from "./SideBar";
import styles from "../styles/mainLayout.module.css"; // Importa el CSS Module para este layout
import { Outlet } from "react-router-dom";


// Layout principal para toda la aplicación
const MainLayout = ({ children }) => {
  // Estado: abierto/cerrado del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hook para colapsar el sidebar por defecto en móvil y expandir en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Corre una vez al montar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Contenedor raíz del layout, horizontal (sidebar + main)
    <div className={styles.layoutRoot}>
      {/* Sidebar reutilizable */}
      <SideBar sidebarOpen={sidebarOpen}  toggleSidebar={() => setSidebarOpen((open) => !open)}/>
      {/* main semántico para el contenido */}
      <main className={styles.mainContent + " flex-grow-1 p-4"} aria-label="Contenido principal" >
        {/* Aquí se cargan las páginas (dashboard, ventas, etc.) */}
         <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
