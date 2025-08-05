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
import AccountsReceivableReport from '../components/accountsreceivable/AccountsReceivableReport'; 
import AccountsReceivableAccount from '../components/accountsreceivable/AccountsReceivableAccount'; 
import DeactivatedCompaniesView from '../components/administration/companyMangment/DeactivatedCompaniesView';
import { Toaster } from 'react-hot-toast';
import CreditNote from '../components/sales/creditnote/CreditNote';
import NewCreditNote from '../components/sales/creditnote/NewCreditNote';
import EditCreditNote from '../components/sales/creditnote/EditCreditNote';
import SalesReport from '../components/sales/reports/SalesReport';
import AccountingEntry from '../components/sales/sales/AccountingEntry';
import UserCompaniesDashboard from '../components/administration/userManagement/UserCompaniesDashboard';
import AccessLogs from '../components/administration/changeHistory/AccessLogs';

import MovementView from '../components/inventory/movements/MovementView';
import ProductView from '../components/inventory/products/ProductView';
import DesableProductView from '../components/inventory/products/DesableProductView';
import MovementListView from '../components/inventory/movements/MovementListView';
import PendingInventoryMovements from '../components/inventory/movements/PendingInventoryMovements';
import AppliedMovementList from '../components/inventory/movements/AppliedMovementList';
import AnullMovementList from '../components/inventory/movements/AnullMovementList';

export default function Rutas() {
  return (
    <BrowserRouter>
     {/* --- PASO 2: AÑADIR EL COMPONENTE TOASTER AQUÍ --- */}
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
                  <Route path="/inventario/moves/pending" element={<PendingInventoryMovements />} />
                  <Route path="/inventario/moves/applied" element={<AppliedMovementList />} />
                  <Route path="/inventario/moves/anull" element={<AnullMovementList />} />
                  
                  {/* Rutas extras que necesites en ventas*/}
                  <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
                  {/* Rutas extras que necesites en CXC*/}
                  <Route path="/inventario" element={<DashboardInventory />} />
                  {/* Rutas extras que necesites en Inventario*/}
                  <Route path="/inventario/productos" element={<ProductView />} />
                  <Route path="/inventario/movimientosproductos" element={<MovementListView />} />
                  {/* Ruta comodín: muestra Dashboard general (puedes personalizar para un 404) */}
                  <Route path="*" element={<Login />} />
                </Route>
              
            </Routes>
          </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}