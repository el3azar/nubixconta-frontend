// src/components/accounting/financial-statements/DashBoardFinancialStatements.jsx
import React from 'react';
import { FaBook, FaBalanceScale, FaChartLine, FaFileInvoice } from 'react-icons/fa';
import DashboardCards from "../../DashboardCards";
import SubMenu from "../../shared/SubMenu";
import ViewContainer from '../../shared/ViewContainer';
import { accountingSubMenuLinks } from '../../../config/menuConfig';

const reportItems = [
  { label: "Libro Diario", icon: FaBook, to: "/contabilidad/estados-financieros/libro-diario" },
  { label: "Libro Mayor", icon: FaBook, to: "/contabilidad/estados-financieros/libro-mayor" },
  { label: "Balance de Comprobación", icon: FaBalanceScale, to: "/contabilidad/estados-financieros/balance-comprobacion" },
  { label: "Estado de Resultados", icon: FaChartLine, to: "/contabilidad/estados-financieros/estado-resultados" },
  { label: "Balance General", icon: FaFileInvoice, to: "/contabilidad/estados-financieros/balance-general" },
];

const DashBoardFinancialStatements = () => (
  <>
    <SubMenu links={accountingSubMenuLinks} />
    <ViewContainer>
        <DashboardCards title="Estados Financieros" items={reportItems} />
    </ViewContainer>
  </>
);

export default DashBoardFinancialStatements;