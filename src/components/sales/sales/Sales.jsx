// src/components/sales/sales/Sales.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { SaleService } from '../../../services/sales/SaleService';
import SubMenu from "../SubMenu";
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';
import viewStyles from '../../../styles/shared/DocumentView.module.css';
import ViewContainer from '../../shared/ViewContainer';
// Definimos la configuración de las columnas aquí, fuera del componente.
const salesColumns = [
  { header: 'Correlativo', accessor: 'saleId', style: { minWidth: '100px' }  },
  { header: 'N° Doc.', accessor: 'documentNumber', style: { minWidth: '130px' }  },
  { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate),style: { minWidth: '140px' } },
  { header: 'Estado', accessor: 'saleStatus' ,style: { minWidth: '110px' }},
  { header: 'Cliente', cell: (doc) => doc.customer?.customerName || 'N/A', style: { minWidth: '250px'},className: viewStyles.textAlignLeft   },
  { header: 'Días Crédito', cell: (doc) => doc.customer?.creditDay || '-', style: { minWidth: '120px' } },
  { header: 'Descripción', accessor: 'saleDescription',style: { minWidth: '400px'}, className: viewStyles.textAlignLeft  },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' }},
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
    view: '/ventas/asiento-contable',
  };

  return (
 <div> {/* Usamos un div simple como contenedor raíz */}
      <SubMenu />
      {/* --- 2. ENVOLVEMOS LA VISTA CON VIEWCONTAINER --- */}
      <ViewContainer>
        <DocumentListView
          pageTitle="Filtrar Ventas"
          listTitle="Ventas"
          queryKey="sales"
          documentService={serviceAdapter}
          routePaths={routePaths}
          newDocumentMessage="Redirigiendo para seleccionar un cliente"
          columns={salesColumns}
          FilterComponent={DefaultFilterComponent}
          ActionsComponent={DefaultActionsComponent}
        />
      </ViewContainer>
    </div>
  );
}