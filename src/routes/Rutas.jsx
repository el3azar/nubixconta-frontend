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
import ViewCustomers from '../components/sales/customer/ViewCustomers';
import NewCustomer from '../components/sales/customer/NewCustomer';
import EditCustomer from "../components/sales/customer/EditCustomer";
import DesactivatedCustomer from '../components/sales/customer/DesactivatedCustomer';
import Sales from '../components/sales/sales/Sales';
import NewSale from '../components/sales/sales/NewSale';
import EditSale from '../components/sales/sales/EditSale';
import DashboardInventory from '../components/inventory/DashBoardInventory';
import CompanyManagementView from '../components/administration/companyMangment/CompanyManagementView';
import UserManagementDashboard from '../components/administration/userManagement/UserManagementDashboard';
import ChangeHistory from '../components/administration/changeHistory/ChangeHistory'
import { CompanyDataProvider } from '../components/administration/companyMangment/CompanyDataContext';
import { AuthProvider } from '../context/AuthContext';
import RegisterCompanyView from '../components/administration/companyMangment/RegisterCompanyView';
import EditCompanyView from '../components/administration/companyMangment/EditCompanyView';
import ViewCompanyDetails from '../components/administration/companyMangment/ViewCompanyDetails';
import AccountsReceivable from '../components/accountsreceivable/AccountsReceivable';
import AccountsReceivableMenu from '../components/accountsreceivable/AccountsReceivableMenu';
import AccountsPayableMenu from '../components/accountspayable/AccountsPayableMenu';
import AccountsReceivableReport from '../components/accountsreceivable/AccountsReceivableReport'; 
import AccountsReceivableAccount from '../components/accountsreceivable/AccountsReceivableAccount'; 
import DeactivatedCompaniesView from '../components/administration/companyMangment/DeactivatedCompaniesView';
import { Toaster } from 'react-hot-toast';
import CreditNote from '../components/sales/creditnote/CreditNote';
import NewCreditNote from '../components/sales/creditnote/NewCreditNote';
import EditCreditNote from '../components/sales/creditnote/EditCreditNote';
import SalesReport from '../components/sales/reports/SalesReport';
import UserCompaniesDashboard from '../components/administration/userManagement/UserCompaniesDashboard';
import AccessLogs from '../components/administration/changeHistory/AccessLogs';

import MovementView from '../components/inventory/movements/MovementView';
import ProductView from '../components/inventory/products/ProductView';
import DesableProductView from '../components/inventory/products/DesableProductView';
import MovementListView from '../components/inventory/movements/MovementListView';
import DetailedSalesView from '../components/accountsreceivable/DetailedSalesView';
import DashBoardPurchases from '../components/purchases/DashBoardPurchases'; 
import ViewSuppliers from '../components/purchases/supplier/ViewSuppliers';
import NewSupplier from '../components/purchases/supplier/NewSupplier';
import EditSupplier from '../components/purchases/supplier/EditSupplier';
import DesactivatedSupplier from '../components/purchases/supplier/DesactivatedSupplier';
import Purchases from '../components/purchases/purchases/Purchases';
import NewPurchase from '../components/purchases/purchases/NewPurchase';
import EditPurchase from '../components/purchases/purchases/EditPurchase';
import ScrollToTop from '../components/shared/ScrollToTop';
import DetailedPayableTable from '../components/accountspayable/DetailedPayableTable';
import DetailedPayableView from '../components/accountspayable/DetailedPayableView';
import AccountsPayable from '../components/accountspayable/AccountsPayable';
import AccountsPayableReport from '../components/accountspayable/AccountsPayableReport';
import AccountPayableStatement from '../components/accountspayable/AccountsPayableAccount';
import AccountsPayableAccount from '../components/accountspayable/AccountsPayableAccount';
import PurchaseCreditNotes from '../components/purchases/creditnote/PurchaseCreditNotes'; // Asumiendo la ruta
import NewPurchaseCreditNote from '../components/purchases/creditnote/NewPurchaseCreditNote';
import EditPurchaseCreditNote from '../components/purchases/creditnote/EditPurchaseCreditNote';

import IncomeTax from '../components/purchases/incometax/IncomeTax';
import NewIncomeTax from '../components/purchases/incometax/NewIncomeTax';
import EditIncomeTax from '../components/purchases/incometax/EditIncomeTax';

import PurchasesReport from '../components/purchases/reports/PurchasesReport';
import DashBoardContabilidad from '../components/accounting/DashBoardAccounting';
import GestionCatalogoPage from '../components/accounting/catalog/GestionCatalogoPage';

export default function Rutas() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Lo configuramos una sola vez con tu paleta de colores. */}
      {/* Estará disponible para toda la aplicación. */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000, 
          style: {
            background: '#1B043B', // Fondo morado oscuro
            color: '#ABAABC',      // Texto gris/lila claro
            border: '1px solid #49207B', // Borde morado medio
            padding: '16px',
            borderRadius: '10px',
            pointerEvents: 'none', // Ignora clics, hover, etc.
      userSelect: 'none',     // Evita que el texto pueda ser seleccionado.
          },
          success: {
            iconTheme: {
              primary: '#7D49CC', // Color del icono (morado vibrante)
              secondary: '#FFF',  // Fondo blanco para el check
            },
          },
          error: {
            style: { border: '1px solid #D32F2F' }, // Borde rojo para errores
            iconTheme: { primary: '#D32F2F', secondary: '#FFF' },
          }
        }}
      />
      {/* --- FIN DEL BLOQUE AÑADIDO --- */}
   
       <AuthProvider> {/* 1. AuthProvider envuelve TODO */}
          <CompanyProvider> {/* 2. CompanyProvider envuelve las rutas */}
            <Routes>
              {/* Ruta pública de login (no requiere layout ni contexto) */}
              <Route path='/' element={<Login />} />

             

                {/* Selección de empresa (asistente) - sin layout */}
                <Route path="/empresas" element={<DashBoardEmpresas />} />

                {/* Rutas internas protegidas con layout (sidebar + header) */}
                <Route element={<MainLayout />}>

                  {/* ======== SECCIÓN: ADMINISTRACIÓN ======== */}
                  {/* Cada opción principal del panel de administración debe agregarse aquí */}
                    {/* Rutas para el usuario*/}

             <Route path="/admin" element={<DashBoardGeneralAdmin />} />
             <Route path="/admin/empresas-contabilidad" element={<DashBoardEmpresas />} />
             <Route path="/admin/usuarios" element={<UserManagementDashboard />} />
             <Route path="/administration/users/:userId/companies" element={<UserCompaniesDashboard/>} />


                  {/* Rutas extras que necesites en gestion de usuarios */}
                  <Route path="/admin/empresas" element={
                    <CompanyDataProvider>
                      <CompanyManagementView />
                    </CompanyDataProvider>
                  } />
                    <Route path="/admin/empresas/desactivadas" element=
                    {<CompanyDataProvider>
                    <DeactivatedCompaniesView />
                    </CompanyDataProvider>
                    } />
                  {/* Rutas extras que necesites en gestion de empresas */}
                  <Route path="/admin/empresas/registronuevo" element={
                    <CompanyDataProvider>
                      <RegisterCompanyView />
                    </CompanyDataProvider>
                    } />
                  <Route path="/admin/empresas/editar/:id" element={
                    <CompanyDataProvider>
                      <EditCompanyView />
                    </CompanyDataProvider>
                    } />

                  <Route
                    path="/admin/empresas/ver/:id"
                    element={
                      <CompanyDataProvider>
                        <ViewCompanyDetails />
                      </CompanyDataProvider>
                    }
                  />

                  <Route path="/admin/bitacora-cambios" element={<ChangeHistory />} />
                  {/* Rutas extras que necesites en Bitácora de cambios*/}
                  <Route path="/admin/bitacora-accesos" element={<AccessLogs />} />
                  {/* Rutas extras que necesites en Bitácora de accesos*/}

                  {/* ======== SECCIÓN: MÓDULOS OPERATIVOS ======== */}
                  {/* Cada módulo principal (ventas, cuentas, inventario, etc.) va aquí */}
                  <Route path="/home" element={<DashBoardGeneral />} />

                  {/* INICIO RUTAS VENTAS */}
                  <Route path="/ventas" element={<DashBoardSales />} />
                  <Route path="/ventas/clientes/desactivated" element={<DesactivatedCustomer />} />
                  <Route path="/ventas/clientes" element={<ViewCustomers/>} />
                  <Route path="/ventas/clientes/nuevo" element={<NewCustomer />} />
                  
                  
                  <Route path="/ventas/clientes/editar/:id" element={<EditCustomer />} />
                  <Route path="/ventas/ventas" element={<Sales />} />
                  <Route path="/ventas/nueva/:clientId" element={<NewSale />} />
                  <Route path="/ventas/editar/:saleId" element={<EditSale />} />


                <Route path="/ventas/notas-credito" element={<CreditNote />} />
                <Route path="/ventas/nueva-nota-credito/:clientId" element={<NewCreditNote />} />
                <Route path="/ventas/editar-nota-credito/:creditNoteId" element={<EditCreditNote />} />
                


                  <Route path="/ventas/reportes" element={<SalesReport />} />



                  {/* 
                  <Route path="/ventas/asiento-contable" element={<AccountingEntry />} />

      */}
                  <Route path="/ventas/reportes" element={<div>Reportes</div>}/>

                  {/* FIN RUTAS VENTAS*/}

                  {/* Rutas del módulo de Cuentas por Cobrar */}
                  <Route path="/cuentas" element={<AccountsReceivableMenu/>} />
                  <Route path="/cuentas/cobros" element={<AccountsReceivable />} />
                  <Route path="/cuentas/reportes" element={<AccountsReceivableReport />} />
                  <Route path="/cuentas/estado_cuenta" element={<AccountsReceivableAccount />} />
                  <Route path="/cuentas/visualizar_ventas" element={<DetailedSalesView/>} />
                  {/* Rutas extras que necesites en CXC */}

        
                  {/* Rutas extras que necesites en Inventario */}

                  {/* Ruta comodín: muestra mensaje o componente personalizado para errores */}
                  <Route path="*" element={<div>404 - Página no encontrada</div>} />
                  {/* Rutas extras que necesites en ventas*/}
                  <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
                  {/* Rutas extras que necesites en CXC*/}
                  <Route path="/inventario" element={<DashboardInventory/>} />
                  {/* Rutas extras que necesites en Inventario*/}
                  <Route path="/inventario/productos" element={<ProductView />} />
                  <Route path="/inventario/movimientosproductos" element={<MovementListView />} />
                  <Route path="/inventario/moves" element={<MovementView />} />
                  <Route path="/inventario/desactiveprod" element={<DesableProductView />} />
                  
                  {/* Rutas extras que necesites en ventas*/}
                  <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
                  {/* Rutas extras que necesites en CXC*/}
                  <Route path="/inventario" element={<DashboardInventory />} />
                  {/* Rutas extras que necesites en Inventario*/}
                  <Route path="/inventario/productos" element={<ProductView />} />
                  <Route path="/inventario/movimientosproductos" element={<MovementListView />} />


                   {/* --- AÑADE LAS NUEVAS RUTAS AQUÍ --- */}
                  <Route path="/compras" element={<DashBoardPurchases />} />
                  <Route path="/compras/proveedores" element={<ViewSuppliers />} />
                  <Route path="/compras/proveedores/nuevo" element={<NewSupplier />} />
                  <Route path="/compras/proveedores/editar/:id" element={<EditSupplier />} />
                  <Route path="/compras/proveedores/desactivados" element={<DesactivatedSupplier />} />


                 {/* Rutas para la gestión de Compras */}
                  <Route path="/compras/compras" element={<Purchases />} />
                  <Route path="/compras/nueva/:supplierId" element={<NewPurchase />} />
                  <Route path="/compras/editar/:purchaseId" element={<EditPurchase />} />
                 


                  {/* Ruta para la vista principal de la tabla */}
                <Route path="/compras/notas-credito" element={<PurchaseCreditNotes />} />

                {/* Ruta para el formulario de nueva NC. Recibe el ID del proveedor */}
                <Route path="/compras/nueva-nota-credito/:supplierId" element={<NewPurchaseCreditNote />} />

                {/* Ruta para el formulario de edición. Recibe el ID de la NC */}
                <Route path="/compras/editar-nota-credito/:creditNoteId" element={<EditPurchaseCreditNote />} />


                <Route path="/compras/isr" element={<IncomeTax />} />
                <Route path="/compras/isr/nuevo/:supplierId" element={<NewIncomeTax />} />
                <Route path="/compras/isr/editar/:id" element={<EditIncomeTax />} />


                <Route path="/compras/reportes" element={<PurchasesReport />} />




                     {/* --- Rutas para cuentas por pagar --- */}
                 


                  <Route path="/cuentas-por-pagar" element={<AccountsPayableMenu/>} />
                  <Route path="/cuentas/visualizar_pagos" element={<DetailedPayableView/>} />
                  <Route path="/cuentas/pagos" element={<AccountsPayable />} />
                  <Route path="/cuentas/pagos/reportes" element={<AccountsPayableReport />} />
                  <Route path="/cuentas/pagos/estado_cuenta" element={<AccountsPayableAccount/>} />

                  <Route path="/bancos" element={<div>Dashboard de Bancos</div>} />









                  <Route path="/contabilidad" element={<DashBoardContabilidad />} />
                  <Route path="/contabilidad/gestion-catalogo" element={<GestionCatalogoPage />} />
                  {/* --- FIN DE LAS NUEVAS RUTAS --- */}



                  {/* Ruta comodín: muestra Dashboard general (puedes personalizar para un 404) */}
                  <Route path="*" element={<Login />} />
                </Route>
              
            </Routes>
          </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}