// src/context/CompanyContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";

const CompanyContext = createContext();

const ACTIVE_COMPANY_KEY = "empresaActiva"; // Usamos la clave que ya tienes

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);

  // El cerebro que se ejecuta al cargar la app para restaurar la sesión de la empresa
  useEffect(() => {
    try {
      const storedCompany = sessionStorage.getItem(ACTIVE_COMPANY_KEY);
      if (storedCompany) {
        setCompany(JSON.parse(storedCompany));
      }
    } catch (error) {
      console.error("Error al restaurar la empresa desde sessionStorage:", error);
      sessionStorage.removeItem(ACTIVE_COMPANY_KEY);
    }
  }, []); // El array vacío [] asegura que se ejecute solo una vez.

  // Función única para seleccionar una empresa: actualiza el estado Y el storage.
  const selectCompany = (companyData) => {
    sessionStorage.setItem(ACTIVE_COMPANY_KEY, JSON.stringify(companyData));
    setCompany(companyData);
  };

  const clearCompany = () => {
    sessionStorage.removeItem(ACTIVE_COMPANY_KEY);
    setCompany(null);
  }

  const contextValue = { company, selectCompany, clearCompany };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);