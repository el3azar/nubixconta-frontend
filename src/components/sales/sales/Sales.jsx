// src/components/sales/sales/Sales.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { SaleService } from '../../../services/sales/SaleService';
import SubMenu from "../SubMenu";
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';

// Definimos la configuración de las columnas aquí, fuera del componente.
const salesColumns = [
  { header: 'Correlativo', accessor: 'saleId' },
  { header: 'N° Doc.', accessor: 'documentNumber' },
  { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate) },
  { header: 'Estado', accessor: 'saleStatus' },
  { header: 'Cliente', cell: (doc) => doc.customer?.customerName || 'N/A' },
  { header: 'Días Crédito', cell: (doc) => doc.customer?.creditDay || '-' },
  { header: 'Descripción', accessor: 'saleDescription' },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}` },
];

export default function Sales() {
  const saleService = SaleService();

  const serviceAdapter = {
    getAll: (sortBy) => saleService.getAllSales(sortBy),
    // Cambiamos 'searchByDate' a un 'search' más genérico
    search: (filters) => saleService.searchSalesByDate(filters),
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
        pageTitle="Filtrar Ventas"
        listTitle="Ventas"
        queryKey="sales"
        documentService={serviceAdapter}
        routePaths={routePaths}
        newDocumentMessage="Redirigiendo para seleccionar un cliente"
        // --- PROPS NUEVAS ---
        columns={salesColumns}
        FilterComponent={DefaultFilterComponent}
        ActionsComponent={DefaultActionsComponent}
      />
    </>
  );
}