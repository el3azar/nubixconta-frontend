// src/components/administration/DashBoardEmpresas.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserCompanies } from "../../services/administration/company/companiesServices";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";
import { FaBuilding } from "react-icons/fa";
import DashboardCards from "../DashboardCards"; // Ajusta el path según tu estructura
import { authService } from "../../services/authServices"; // <-- ¡NUEVO! Usamos el servicio centralizado.

import { toast } from "react-hot-toast"; // Para notificaciones

const DashBoardEmpresas = () => {
  const { token,login,role } = useAuth();
  const { selectCompany } = useCompany();
  const [empresas, setEmpresas] = useState([]);
   const navigate = useNavigate();

  // useEffect para cargar las empresas del usuario cuando el componente se monta.
  useEffect(() => {
    const fetchCompanies = async () => {
      if (token) {
        try {
          const result = await getUserCompanies(token);
          setEmpresas(result || []); // Aseguramos que 'empresas' sea siempre un array.
        } catch (error) {
          toast.error("No se pudieron cargar las empresas asignadas.");
          console.error("Error fetching companies:", error);
        }
      }
    };
    fetchCompanies();
  }, [token]); // Se ejecuta cada vez que el token cambie.

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

 /**
   * FUNCIÓN CLAVE: Orquesta el proceso de selección de empresa.
   * Se ejecuta cuando el usuario hace clic en una de las tarjetas de empresa.
   * @param {number} index - El índice de la empresa seleccionada en el array 'empresas'.
   */
  const handleCompanySelect = async (index) => {
    const empresaSeleccionada = empresas[index];
    if (!token) {
        toast.error("Error de autenticación. Por favor, inicie sesión de nuevo.");
        return;
    }

    try {
      toast.loading('Configurando empresa...', { id: 'loading-company' });

      // 1. LLAMAR AL SERVICIO DE AUTENTICACIÓN
      //    Pasamos el ID de la empresa y el token actual para obtener un nuevo token "especializado".
      const response = await authService.selectCompany(empresaSeleccionada.id, token);

      // 2. OBTENER EL NUEVO TOKEN CON SCOPE DE EMPRESA
      const newScopedToken = response.token;

      // 3. ACTUALIZAR EL ESTADO GLOBAL DE AUTENTICACIÓN
      //    Llamamos a la función 'login' de nuestro AuthContext. Ella se encarga de
      //    actualizar el estado de React y el sessionStorage.
      login(newScopedToken, role); // No pasamos accessLogId aquí porque no se genera uno nuevo.
      selectCompany(empresaSeleccionada);
      
      toast.dismiss('loading-company');
      toast.success(`Bienvenido a ${empresaSeleccionada.companyName}`);

      // 5. NAVEGAR AL DASHBOARD PRINCIPAL DE MÓDULOS
      navigate("/home");

    } catch (error) {
      toast.dismiss('loading-company');
      const errorMessage = error.response?.data?.message || error.response?.data || "Error al seleccionar la empresa.";
      toast.error(errorMessage);
      console.error("Error al seleccionar la empresa:", error);
    }
  };

  return (
   <div
      style={{
        backgroundColor: "#ABAABC",
        minHeight: "100vh",
        width: "100%",
        padding: "2rem 1rem",
        boxSizing: "border-box"
      }}
    >
      <DashboardCards
        title="Empresas asignadas"
        items={items}
        onCardClick={handleCompanySelect}
      />
    </div>
  );
};

export default DashBoardEmpresas;
