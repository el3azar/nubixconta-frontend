import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout';
import Login from '../components/Login'
import DashBoardSales from '../components/sales/DashBoardSales'

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
          <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
          
          <Route path="/inventario" element={<div>Inventario</div>} />
          {/* Ruta por defecto para cualquier otra */}
          <Route path="*" element={<DashBoardSales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}   