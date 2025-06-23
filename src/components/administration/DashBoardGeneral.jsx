import { useEffect } from "react";
import { useCompany } from "../../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../DashboardCards";
// ICONOS (puedes usar los que prefieras de react-icons)
import { FaChartLine, FaBoxes, FaHandHoldingUsd } from "react-icons/fa";

const DashBoardGeneral = () => {
  const { company, setCompany } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (!company) {
      // Intenta recuperar del sessionStorage:
      const stored = sessionStorage.getItem("empresaActiva");
      if (stored) {
        setCompany(JSON.parse(stored));
      } else {
        // Si no hay nada, redirige a /empresas
        navigate("/empresas");
      }
    }
  }, [company, setCompany, navigate]);

  // Define los módulos que quieres mostrar en el dashboard general
  const items = [
    { label: "Ventas", icon: FaChartLine, to: "/ventas" },
    { label: "Inventario", icon: FaBoxes, to: "/inventario" },
    { label: "Cuentas por Cobrar", icon: FaHandHoldingUsd, to: "/cuentas" }
  ];

  return (
    <section>
      <h2 className="mb-4">
        {company
          ? `Bienvenido a ${company.companyName}`
          : "Seleccione una empresa para comenzar"}
      </h2>
      <DashboardCards title="MÓDULOS" items={items} />
    </section>
  );
};

export default DashBoardGeneral;

