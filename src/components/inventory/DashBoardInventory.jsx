// src/components/inventory/DashBoardInventory.jsx o src/pages/DashboardInventory.jsx
import { FaBoxes, FaDollyFlatbed, FaRegFileAlt } from "react-icons/fa";
import DashboardCards from "../../components/DashboardCards";

const inventoryItems = [
  { label: "Productos", icon: FaBoxes, to: "/inventario/productos" },
  { label: "Gestionar movimientos de Inventario", icon: FaDollyFlatbed, to: "/inventario/moves" },
  { label: "Reportes de movimientos de Productos", icon: FaRegFileAlt, to: "/inventario/movimientosproductos" },
];

const InventoryDashboard = () => (
  <div className="container mt-4">
    <DashboardCards title="INVENTARIO" items={inventoryItems} />
  </div>
);

export default InventoryDashboard;
