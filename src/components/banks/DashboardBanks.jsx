// src/components/inventory/DashBoardInventory.jsx o src/pages/DashboardInventory.jsx
import { FaBoxes, FaDollyFlatbed, FaRegFileAlt } from "react-icons/fa";
import { BsBank2, BsFileEarmarkBarGraphFill  } from "react-icons/bs";
import DashboardCards from "../../components/DashboardCards";

const banksItems = [
  { label: "Transacciones", icon: BsBank2, to: "/bancos/transacciones" },
  { label: "Reportes", icon: BsFileEarmarkBarGraphFill, to: "/bancos/reportes" },
  { label: "Pruebas", icon: BsFileEarmarkBarGraphFill, to: "/bancos/pruebas" },
];

const BanksDashboard = () => (
  <div className="container mt-4">
    <DashboardCards title="BANCOS" items={banksItems} />
  </div>
);

export default BanksDashboard;
