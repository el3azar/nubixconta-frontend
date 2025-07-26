// src/components/inventory/DashBoardInventory.jsx o src/pages/DashboardInventory.jsx
import { FaBoxes, FaDolly } from "react-icons/fa";
import DashboardCards from "../../components/DashboardCards";

const inventoryItems = [
  { label: "Productos", icon: FaBoxes, to: "/inventario/productos" },
  { label: "Ver Movimientos de Productos", icon: FaDolly, to: "/inventario/movimientosproductos" },
];

const InventoryDashboard = () => (
  <div className="container mt-4">
    <DashboardCards title="INVENTARIO" items={inventoryItems} />
  </div>
);

export default InventoryDashboard;
