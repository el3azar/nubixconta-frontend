// src/components/administration/DashBoardGeneralAdmin.jsx
import { FaBuilding, FaUsers, FaSync, FaDoorOpen } from "react-icons/fa";
import DashboardCards from "../DashboardCards";

const adminItems = [
  { label: "Empresas", icon: FaBuilding, to: "/admin/empresas" },
  { label: "Usuarios", icon: FaUsers, to: "/admin/usuarios" },
  { label: "Bitácora de cambios", icon: FaSync, to: "/admin/bitacora-cambios" },
  { label: "Bitácora de accesos", icon: FaDoorOpen, to: "/admin/bitacora-accesos" },
];

const DashBoardGeneralAdmin = () => (
  <DashboardCards title="ADMINISTRACIÓN" items={adminItems} />
);

export default DashBoardGeneralAdmin;
