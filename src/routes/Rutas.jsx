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
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout';
import Login from '../components/Login'
import DashBoardSales from '../components/sales/DashBoardSales'
import DashBoardEmpresas from '../components/administration/DashBoardEmpresas';
import DashBoardGeneral from '../components/administration/DashBoardGeneral';
import DashBoardGeneralAdmin from '../components/administration/DashBoardGeneralAdmin';
import { CompanyProvider } from '../context/CompanyContext';
import DashboardInventory from '../components/inventory/DashBoardInventory';
import ProductList from '../components/inventory/ProductList';
import ProductMovementList from '../components/inventory/ProductMovementList';


export default function Rutas() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login (no requiere layout ni contexto) */}
        <Route path='/' element={<Login />} />

        {/* Rutas que requieren contexto de empresa */}
        <Route element={<CompanyProvider />}>

          {/* Selección de empresa (asistente) - sin layout */}
          <Route path="/empresas" element={<DashBoardEmpresas />} />

          {/* Rutas internas protegidas con layout (sidebar + header) */}
          <Route element={<MainLayout />}>

            {/* ======== SECCIÓN: ADMINISTRACIÓN ======== */}
            {/* Cada opción principal del panel de administración debe agregarse aquí */}
            <Route path="/admin" element={<DashBoardGeneralAdmin />} />
            {/* 
              Reemplaza <div> por tu componente principal de cada módulo:
              Ejemplo:
                <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
            */}
            <Route path="/admin/usuarios" element={<div>Gestión de usuarios</div>} />
            {/* Rutas extras que necesites en gestion de usuarios */}
            <Route path="/admin/empresas" element={<div>Gestión de empresas</div>} />
             {/* Rutas extras que necesites en gestion de empresas */}
            <Route path="/admin/bitacora-cambios" element={<div>Bitácora de cambios</div>} />
             {/* Rutas extras que necesites en Bitácora de cambios*/}
            <Route path="/admin/bitacora-accesos" element={<div>Bitácora de accesos</div>} />
            {/* Rutas extras que necesites en Bitácora de accesos*/}

            {/* ======== SECCIÓN: MÓDULOS OPERATIVOS ======== */}
            {/* Cada módulo principal (ventas, cuentas, inventario, etc.) va aquí */}
            <Route path="/home" element={<DashBoardGeneral />} />
            {/* 
              Reemplaza <div> por tu componente principal del módulo.
              Ejemplo:
                <Route path="/ventas" element={<VentasDashboard />} />
            */}
            <Route path="/ventas" element={<DashBoardSales />} />
            {/* Rutas extras que necesites en ventas*/}
            <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
             {/* Rutas extras que necesites en CXC*/}
            <Route path="/inventario" element={<DashboardInventory />} />
             {/* Rutas extras que necesites en Inventario*/}
             <Route path="/inventario/productos" element={<ProductList />} />
             <Route path="/inventario/movimientosproductos" element={<ProductMovementList />} />
            
            {/* Ruta comodín: muestra Dashboard general (puedes personalizar para un 404) */}
            <Route path="*" element={<Login />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}