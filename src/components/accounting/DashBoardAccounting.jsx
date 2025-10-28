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
    label: "Estados Financieros", 
    icon: FaFileInvoiceDollar, 
    to: "/contabilidad/estados-financieros" // Ruta para la futura pantalla de reportes
  },
  { 
    label: "Transacciones Contables", 
    icon: FaExchangeAlt, 
    to: "/contabilidad/transacciones" // Ruta para la futura pantalla de partidas contables
  },
];

const DashBoardContabilidad = () => (
  // Reutilizamos la misma estructura de los otros dashboards para mantener la consistencia.
  <section className={layoutStyles.viewWrapper}>
    <DashboardCards title="CONTABILIDAD" items={accountingItems} />
  </section>
);

export default DashBoardContabilidad;