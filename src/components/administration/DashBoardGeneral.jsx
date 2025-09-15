import { useEffect } from "react";
import { useCompany } from "../../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../DashboardCards";
// ICONOS (puedes usar los que prefieras de react-icons)
import { FaChartLine, FaBoxes, FaHandHoldingUsd,FaShoppingCart,FaFileInvoiceDollar,FaLandmark,FaBook } from "react-icons/fa";
import layoutStyles from "../../styles/mainLayout.module.css"; 

const DashBoardGeneral = () => {
  const { company } = useCompany();
  const navigate = useNavigate();

 

  // Define los módulos que quieres mostrar en el dashboard general
  const items = [
    { label: "Ventas", icon: FaChartLine, to: "/ventas" },
    { label: "Inventario", icon: FaBoxes, to: "/inventario" },
    { label: "Cuentas por Cobrar", icon: FaHandHoldingUsd, to: "/cuentas" },
     { label: "Compras", icon: FaShoppingCart, to: "/compras" },
    { label: "Cuentas por Pagar", icon: FaFileInvoiceDollar, to: "/cuentas-por-pagar" },
    { label: "Bancos", icon: FaLandmark, to: "/bancos" },
    { label: "Contabilidad", icon: FaBook, to: "/contabilidad" }
  ];

 return (
    // CAMBIO: Se envuelve todo en la nueva clase viewWrapper
    <section className={layoutStyles.viewWrapper}>
      <h2 className="mb-4">
        {company ? `Bienvenido a ${company.companyName}` : "Seleccione una empresa"}
      </h2>
      <DashboardCards title="MÓDULOS" items={items} />
    </section>
  );
};

export default DashBoardGeneral;

