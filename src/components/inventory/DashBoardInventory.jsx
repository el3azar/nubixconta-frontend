// src/pages/DashboardInventory.jsx
import { FaBoxes, FaDolly } from "react-icons/fa";
import DashboardCards from "../DashboardCards";

// Define los items para el dashboard de inventario
const inventoryItems = [
  { label: "Productos", icon: FaBoxes, to: "/inventario/productos" },
  { label: "Ver Movimientos de Productos", icon: FaDolly, to: "/inventario/movimientosproductos" },
];

const InventoryDashboard = () => <DashboardCards title="INVENTARIO" items={inventoryItems} />;

export default InventoryDashboard;

