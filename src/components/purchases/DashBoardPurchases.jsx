import React from 'react';
import { FaTruck, FaShoppingCart, FaStickyNote, FaPercentage,FaClipboardList } from "react-icons/fa";
import DashboardCards from "../DashboardCards";
import layoutStyles from "../../styles/mainLayout.module.css";

// 1. Definimos los items para el dashboard de compras.
//    - Usamos los nombres que solicitaste.
//    - Asignamos iconos representativos.
//    - Definimos las futuras rutas a las que navegarán.
const purchasesItems = [
  { label: "Proveedores", icon: FaTruck, to: "/compras/proveedores" },
  { label: "Compras", icon: FaShoppingCart, to: "/compras/compras" },
  { label: "Notas de Crédito", icon: FaStickyNote, to: "/compras/notas-credito" }, // Nota: Generalmente son "Notas de Débito" en compras, pero usamos el nombre que pediste.
  { label: "Impuesto sobre la Renta", icon: FaPercentage, to: "/compras/reportes-isr" }, // Usamos una ruta más descriptiva.
  { label: "Reportes",icon: FaClipboardList, to: "/compras/reportes" } // Usamos una ruta más descriptiva.
];

const DashBoardPurchases = () => (
  // 2. Reutilizamos la misma estructura y estilos que los otros dashboards
  //    para mantener la consistencia visual.
  <section className={layoutStyles.viewWrapper}>
    <DashboardCards title="COMPRAS" items={purchasesItems} />
  </section>
);

export default DashBoardPurchases;