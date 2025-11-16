import React from 'react';
import { FaSitemap, FaFileInvoiceDollar, FaExchangeAlt, FaCalendarCheck } from "react-icons/fa"; 
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
    label: "Cierre de Períodos",
    icon: FaCalendarCheck,
    to: "/contabilidad/cierres"
  },
  { 
    label: "Estados Financieros", 
    icon: FaFileInvoiceDollar, 
    to: "/contabilidad/estados-financieros" // Ahora apunta a la nueva página de dashboard
  },
];

const DashBoardContabilidad = () => (
  // Reutilizamos la misma estructura de los otros dashboards para mantener la consistencia.
  <section className={layoutStyles.viewWrapper}>
    <DashboardCards title="CONTABILIDAD" items={accountingItems} />
  </section>
);

export default DashBoardContabilidad;