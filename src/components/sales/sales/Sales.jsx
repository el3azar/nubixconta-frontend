// src/components/sales/Sales.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { SaleService } from '../../../services/sales/SaleService';
import SubMenu from "../SubMenu";

export default function Sales() {
  const saleService = SaleService();

  // El "Adaptador" traduce los nombres de funciones específicos a los nombres genéricos
  // que espera DocumentListView.
  const serviceAdapter = {
    getAll: (sortBy) => saleService.getAllSales(sortBy),
    searchByDate: (filters) => saleService.searchSalesByDate(filters),
    approve: (id) => saleService.approveSale(id),
    cancel: (id) => saleService.cancelSale(id),
    delete: (id) => saleService.deleteSale(id),
  };

  const routePaths = {
    new: '/ventas/clientes',
    edit: '/ventas/editar',
    view: '/ventas/ver',
  };

  return (
    <>
      <SubMenu />
      <DocumentListView
        documentType="Venta"
        queryKey="sales"
        documentService={serviceAdapter}
        routePaths={routePaths}
        newDocumentMessage="Redirigiendo para seleccionar un cliente"
      />
    </>
  );
}