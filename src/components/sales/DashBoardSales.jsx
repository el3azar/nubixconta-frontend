// src/pages/VentasDashboard.jsx
import { FaUsers, FaChartLine, FaFileInvoiceDollar, FaClipboardList } from "react-icons/fa";

import DashboardCards from "../DashboardCards";
import layoutStyles from "../../styles/mainLayout.module.css"

// Define los items para el dashboard de ventas
const ventasItems = [
  { label: "Clientes", icon: FaUsers, to: "/ventas/clientes" },
  { label: "Ventas", icon: FaChartLine, to: "/ventas/ventas" },
  { label: "Nota de Credito", icon: FaFileInvoiceDollar, to: "/ventas/notas-credito" },
  { label: "Reportes", icon: FaClipboardList, to: "/ventas/reportes" }
];

const DashBoardSales = () => (
  // CAMBIO: Se envuelve el componente en la nueva clase viewWrapper
  <section className={layoutStyles.viewWrapper}>
    <DashboardCards title="VENTAS" items={ventasItems} />
  </section>
);

export default DashBoardSales;

