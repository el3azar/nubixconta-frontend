import React from "react";
import { FaHandHoldingUsd } from "react-icons/fa";
import { MdOutlineBarChart } from "react-icons/md";
import { RiBillLine } from "react-icons/ri";
import { HiOutlineDocumentReport } from "react-icons/hi";
import DashboardCards from "../../components/DashboardCards"; 

const AccountsReceivableMenu = () => {
  const items = [
    { label: "Cobros", icon: FaHandHoldingUsd, to: "/cuentas/cobros" },
    { label: "Estado de cuenta", icon: RiBillLine, to: "/cuentas/estado_cuenta" },
    { label: "Reportes", icon: HiOutlineDocumentReport, to: "/cuentas/reportes" },
    { label: "Visualizacion de ventas", icon: HiOutlineDocumentReport, to: "/cuentas/visualizar_ventas" },
  ];

  return (
    <div className="container mt-4">
      <DashboardCards title="CUENTAS POR COBRAR" items={items} />
    </div>
  );
};

export default AccountsReceivableMenu;

