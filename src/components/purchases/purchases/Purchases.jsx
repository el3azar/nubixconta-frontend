import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { usePurchaseService } from '../../../services/purchases/PurchaseService';
import SubMenu from "../../shared/SubMenu"; 
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';
import ViewContainer from '../../shared/ViewContainer';
// TODO: Debes crear esta configuración en tu archivo 'src/config/menuConfig.js'
import { purchasesSubMenuLinks } from '../../../config/menuConfig'; 
import viewStyles from '../../../styles/shared/DocumentView.module.css';

// 1. Definimos las columnas específicas para la tabla de Compras
//    Los 'accessor' y 'cell' usan los campos del PurchaseResponseDTO.
const purchasesColumns = [
  { header: 'Correlativo', accessor: 'idPurchase', style: { minWidth: '100px' } },
  { header: 'N° Doc.', accessor: 'documentNumber', style: { minWidth: '130px' } },
  { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate), style: { minWidth: '140px' } },
  { header: 'Estado', accessor: 'purchaseStatus', style: { minWidth: '110px' } },
  { header: 'Proveedor', cell: (doc) => doc.supplier?.supplierName || 'N/A', style: { minWidth: '250px' }, className: viewStyles.textAlignLeft },
  { header: 'Días Crédito', cell: (doc) => doc.supplier?.creditDay ?? '-', style: { minWidth: '120px' } },
  { header: 'Descripción', accessor: 'purchaseDescription', style: { minWidth: '400px' }, className: viewStyles.textAlignLeft },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' } },
];

export default function Purchases() {
  const purchaseService = usePurchaseService();

  // 2. Creamos el 'adaptador' para conectar nuestro servicio con el componente genérico.
  const serviceAdapter = {
    getAll: (sortBy) => purchaseService.getAllPurchases(sortBy),
    search: (filters) => purchaseService.searchPurchasesByCriteria(filters), // Asumimos que el filtro de fecha usará el de reportes por ahora
    approve: (id) => purchaseService.applyPurchase(id),
    cancel: (id) => purchaseService.cancelPurchase(id),
    delete: (id) => purchaseService.deletePurchase(id),
  };

  // 3. Definimos las rutas para la navegación. 'new' apunta a la lista de proveedores.
  const routePaths = {
    new: '/compras/proveedores', // Equivalente a '/ventas/clientes'
    edit: '/compras/editar',
  };

  return (
    <div>
      <SubMenu links={purchasesSubMenuLinks} />
      <ViewContainer>
        {/* 4. Renderizamos el componente genérico con la configuración de Compras */}
        <DocumentListView
          pageTitle="Filtrar Compras"
          listTitle="Compras"
          queryKey="purchases"
          documentService={serviceAdapter}
          routePaths={routePaths}
          newDocumentMessage="Redirigiendo para seleccionar un proveedor"
          columns={purchasesColumns}
          FilterComponent={DefaultFilterComponent}
          ActionsComponent={DefaultActionsComponent}
        />
      </ViewContainer>
    </div>
  );
}