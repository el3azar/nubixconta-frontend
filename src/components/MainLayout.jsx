// Tu código original
import { useState, useEffect } from "react";
import SideBar from "./SideBar";
import styles from "../styles/mainLayout.module.css";
import { Outlet } from "react-router-dom";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.layoutRoot}>
      <SideBar sidebarOpen={sidebarOpen}  toggleSidebar={() => setSidebarOpen((open) => !open)}/>
      <main className={styles.mainContent + " flex-grow-1 p-4"} aria-label="Contenido principal" >
         <Outlet />
      </main>
    </div>
  );
};
export default MainLayout;