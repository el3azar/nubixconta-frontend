import React from "react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdPayment,MdShoppingCart } from "react-icons/md";
import DashboardCards from "../../components/DashboardCards";
import { HiOutlineDocumentReport } from "react-icons/hi";
const AccountsPayableMenu = () => {
  const items = [
    { label: "Pagos", icon: MdPayment, to: "/cuentas/pagos" },
    { label: "Estado de cuenta", icon: FaMoneyCheckAlt, to: "/cuentas/estado_cuenta" },
    { label: "Reportes", icon: HiOutlineDocumentReport, to: "/cuentas/reportes" },
     { label: "Visualización de compras", icon:MdShoppingCart, to: "/cuentas/visualizar_pagos" },

  ];

  return (
    <div className="container mt-4">
      <DashboardCards title="CUENTAS POR PAGAR" items={items} />
    </div>
  );
};

export default AccountsPayableMenu;


