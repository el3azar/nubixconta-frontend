import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout';
import DashBoardSales from '../components/sales/DashBoardSales'
import CompanyManagementView from '../components/administration/companyMangment/CompanyManagementView'

export default function Rutas() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/ventas" element={<DashBoardSales />} />
          <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
          <Route path="/admin" element={<CompanyManagementView/>} />
          <Route path="/inventario" element={<div>Inventario</div>} />
          {/* Ruta por defecto */}
          <Route path="*" element={<DashBoardSales />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}   