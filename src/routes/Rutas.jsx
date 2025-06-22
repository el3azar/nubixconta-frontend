import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout';
import DashBoardSales from '../components/sales/DashBoardSales';
import DashBoardInventory from '../components/inventory/DashBoardInventory';
import ProductList from '../components/inventory/ProductList';
import ProductMovementList from '../components/inventory/ProductMovementList'; 


export default function Rutas() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/ventas" element={<DashBoardSales />} />
          <Route path="/cuentas" element={<div>Cuentas por Cobrar</div>} />
          <Route path="/admin" element={<div>Administración</div>} />
          <Route path="/inventario" element={<DashBoardInventory />} />
          <Route path="/inventario/productos" element={<ProductList />} />
          <Route path="/inventario/movimientosproductos" element={<ProductMovementList />} />
          {/* Ruta por defecto */}
          <Route path="*" element={<DashBoardSales />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}   