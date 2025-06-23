// src/components/administration/DashBoardEmpresas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserCompanies } from "../../services/administration/companiesServices";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";
import { FaBuilding } from "react-icons/fa";
import DashboardCards from "../DashboardCards"; // Ajusta el path según tu estructura

const DashBoardEmpresas = () => {
  const { token } = useAuth();
  const { setCompany } = useCompany();
  const [empresas, setEmpresas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      const result = await getUserCompanies(token);
      setEmpresas(result);
    };
    fetchCompanies();
  }, [token]);

  // Prepara items para DashboardCards
  const items = empresas.map(emp => ({
    label: emp.companyName,
    icon: FaBuilding,
    extraInfo: emp.companyDui
      ? `DUI: ${emp.companyDui}`
      : emp.companyNit
        ? `NIT: ${emp.companyNit}`
        : "",
  }));

  // Handler para seleccionar empresa
const handleCardClick = (index) => {
  setCompany(empresas[index]);
  // Guarda en sessionStorage:
  sessionStorage.setItem("empresaActiva", JSON.stringify(empresas[index]));
  navigate("/home");
};

  return (
    <DashboardCards
      title="Empresas asignadas"
      items={items}
      onCardClick={handleCardClick}
    />
  );
};

export default DashBoardEmpresas;
