/**
 * Rutas principales de NubixConta (React Router v6+)
 * --------------------------------------------------
 * Este archivo centraliza la configuración de rutas para la aplicación NubixConta.
 * Cada colaborador debe integrar aquí el componente principal de su módulo, siguiendo la estructura y comentarios.
 *
 * Convenciones:
 *  - Todas las rutas protegidas deben ir DENTRO de <CompanyProvider> y <MainLayout>.
 *  - Para nuevas rutas principales (módulos), agregar su <Route> donde se indica.
 *  - Para páginas de administración, agregar la ruta bajo el bloque de administración.
 *  - Todas las rutas nuevas deben importar el componente correspondiente arriba.
 */

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Login from '../components/Login';
import DashBoardSales from '../components/sales/DashBoardSales';
import AccountsReceivable from '../components/accountsreceivable/AccountsReceivable';
import AccountsReceivableMenu from '../components/accountsreceivable/AccountsReceivableMenu';
import AccountsReceivableReport from '../components/accountsreceivable/AccountsReceivableReport'; 
import AccountsReceivableAccount from '../components/accountsreceivable/AccountsReceivableAccount'; 
import DashBoardEmpresas from '../components/administration/DashBoardEmpresas';
import DashBoardGeneral from '../components/administration/DashBoardGeneral';
import DashBoardGeneralAdmin from '../components/administration/DashBoardGeneralAdmin';
import { CompanyProvider } from '../context/CompanyContext';
import CompanyManagementView from '../components/administration/companyMangment/CompanyManagementView';

export default function Rutas() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login (no requiere layout ni contexto) */}
        <Route path='/' element={<Login />} />

        {/* Selección de empresa (asistente) - sin layout */}
        <Route path="/empresas" element={<DashBoardEmpresas />} />

        {/* Rutas que requieren contexto de empresa */}
        <Route element={<CompanyProvider />}>
          {/* Agrupa rutas protegidas dentro del layout */}
          <Route element={<MainLayout />}>

            {/* Ruta por defecto para asistentes u otros roles */}
            <Route path="/home" element={<DashBoardGeneral />} />

            {/* ======== SECCIÓN: ADMINISTRACIÓN ======== */}
            {/* Cada opción principal del panel de administración debe agregarse aquí */}
            <Route path="/admin" element={<DashBoardGeneralAdmin />} />
            <Route path="/admin/usuarios" element={<div>Gestión de usuarios</div>} />
            {/* Rutas extras que necesites en gestión de usuarios */}
            <Route path="/admin/empresas" element={<CompanyManagementView />} />
            {/* Rutas extras que necesites en gestión de empresas */}
            <Route path="/admin/bitacora-cambios" element={<div>Bitácora de cambios</div>} />
            {/* Rutas extras que necesites en Bitácora de cambios */}
            <Route path="/admin/bitacora-accesos" element={<div>Bitácora de accesos</div>} />
            {/* Rutas extras que necesites en Bitácora de accesos */}

            {/* ======== SECCIÓN: MÓDULOS OPERATIVOS ======== */}
            {/* Cada módulo principal (ventas, cuentas, inventario, etc.) va aquí */}
            <Route path="/ventas" element={<DashBoardSales />} />
            {/* Rutas extras que necesites en ventas */}

            {/* Rutas del módulo de Cuentas por Cobrar */}
            <Route path="/cuentas" element={<AccountsReceivableMenu />} />
            <Route path="/cuentas/cobros" element={<AccountsReceivable />} />
            <Route path="/cuentas/reportes" element={<AccountsReceivableReport />} />
            <Route path="/cuentas/estado_cuenta" element={<AccountsReceivableAccount />} />
            {/* Rutas extras que necesites en CXC */}

            <Route path="/inventario" element={<div>Inventario</div>} />
            {/* Rutas extras que necesites en Inventario */}

            {/* Ruta comodín: muestra mensaje o componente personalizado para errores */}
            <Route path="*" element={<div>404 - Página no encontrada</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
