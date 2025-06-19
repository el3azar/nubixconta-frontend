// src/pages/VentasDashboard.jsx
import { FaUsers, FaChartLine, FaFileInvoiceDollar, FaUserCheck } from "react-icons/fa";
import DashboardCards from "../DashboardCards";

// Define los items para el dashboard de ventas
const ventasItems = [
  { label: "Clientes", icon: FaUsers, to: "/ventas/clientes" },
  { label: "Ventas", icon: FaChartLine, to: "/ventas/ventas" },
  { label: "Nota de Credito", icon: FaFileInvoiceDollar, to: "/ventas/nota-credito" },
  { label: "Reportes", icon: FaUserCheck, to: "/ventas/reportes" }
];

const VentasDashboard = () => <DashboardCards title="VENTAS" items={ventasItems} />;

export default VentasDashboard;

