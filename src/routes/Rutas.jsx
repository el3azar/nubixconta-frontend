import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout';
import Login from '../components/Login'
import DashBoardSales from '../components/sales/DashBoardSales'
import AccountsReceivable from '../components/accountsreceivable/AccountsReceivable';
import AccountsReceivableMenu from '../components/accountsreceivable/AccountsReceivableMenu';
import AccountsReceivableReport from '../components/accountsreceivable/AccountsReceivableReport'; 
import AccountsReceivableAccount from '../components/accountsreceivable/AccountsReceivableAccount'; 
export default function Rutas() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública, sin layout */}
        <Route path='/' element={<Login />} />
        
        {/* Ruta fuera del sidebar para el administrador */}
        <Route path="/admin" element={<div className='text-dark'>Administración</div>} />
        {/* Agrupa rutas protegidas dentro del layout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<div  className='text-dark'>DashBoard General de los modulos para asistente</div>} />
          <Route path="/ventas" element={<DashBoardSales />} />
         
          
          <Route path="/inventario" element={<div>Inventario</div>} />

          {/*Rutas del modulo de AccountsReceivable*/}
      <Route path="/cuentas" element={<AccountsReceivableMenu/>} />
      <Route path="/cuentas/cobros" element={<AccountsReceivable/>} />
       <Route path="/cuentas/reportes" element={<AccountsReceivableReport />} />
       <Route path="/cuentas/estado_cuenta" element={<AccountsReceivableAccount/>}></Route>
          {/* Ruta por defecto para cualquier otra */}
          <Route path="*" element={<DashBoardSales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}   