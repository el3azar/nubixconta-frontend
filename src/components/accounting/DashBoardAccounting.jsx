// src/components/accounting/DashBoardContabilidad.jsx

import React from 'react';
import { FaSitemap, FaFileInvoiceDollar, FaExchangeAlt } from "react-icons/fa";
import DashboardCards from "../DashboardCards";
import layoutStyles from "../../styles/mainLayout.module.css";

// Definimos los items para el dashboard de contabilidad con las nuevas opciones.
const accountingItems = [
  { 
    label: "Catalogo de Cuentas", 
    icon: FaSitemap, 
    to: "/contabilidad/gestion-catalogo" 
  },
 { 
    label: "Transacciones Contables", 
    icon: FaExchangeAlt, 
    to: "/contabilidad/transacciones"
  },
  { 
    label: "Estados Financieros", 
    icon: FaFileInvoiceDollar, 
    // Apuntamos al primer reporte como página de inicio de la sección
    to: "/contabilidad/estados-financieros/libro-diario" 
  },
];

const DashBoardContabilidad = () => (
  // Reutilizamos la misma estructura de los otros dashboards para mantener la consistencia.
  <section className={layoutStyles.viewWrapper}>
    <DashboardCards title="CONTABILIDAD" items={accountingItems} />
  </section>
);

export default DashBoardContabilidad;