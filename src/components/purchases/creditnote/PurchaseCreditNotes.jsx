// src/components/purchases/PurchaseCreditNotes.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { usePurchaseCreditNoteService } from '../../../services/purchases/PurchaseCreditNoteService';
import SubMenu from "../../shared/SubMenu";
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';
import ViewContainer from '../../shared/ViewContainer';
import { purchasesSubMenuLinks } from '../../../config/menuConfig';
import viewStyles from '../../../styles/shared/DocumentView.module.css';

// 1. Definimos las columnas específicas para la tabla, basadas en el DTO de respuesta.
const creditNoteColumns = [
  { header: 'Correlativo', accessor: 'idPurchaseCreditNote', style: { minWidth: '100px' } },
  { header: 'N° Doc.', accessor: 'documentNumber', style: { minWidth: '130px' } },
  { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate), style: { minWidth: '140px' } },
  { header: 'Estado', accessor: 'creditNoteStatus', style: { minWidth: '110px' } },
  // Usamos optional chaining (?.) para acceder de forma segura a datos anidados.
  { header: 'Proveedor', cell: (doc) => doc.purchase?.supplier?.supplierName || 'N/A', style: { minWidth: '250px' }, className: viewStyles.textAlignLeft },
  { header: 'Compra Afectada', cell: (doc) => doc.purchase?.documentNumber || 'N/A', style: { minWidth: '150px' } },
  { header: 'Descripción', accessor: 'description', style: { minWidth: '350px' }, className: viewStyles.textAlignLeft },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' } },
];

export default function PurchaseCreditNotes() {
  const purchaseCreditNoteService = usePurchaseCreditNoteService();

  // 2. Creamos el 'adaptador' para que los nombres de las funciones de nuestro servicio
  //    coincidan con los que espera el componente DocumentListView.
  const serviceAdapter = {
    // Nota: Los nombres (getAll, search, approve, etc.) son los que DocumentListView
    // espera internamente en sus props.
    getAll: (sortBy) => purchaseCreditNoteService.getAll(sortBy),
    search: (filters) => purchaseCreditNoteService.search(filters), // Aunque no haga nada, lo pasamos.
    approve: (id) => purchaseCreditNoteService.approve(id),
    cancel: (id) => purchaseCreditNoteService.cancel(id),
    delete: (id) => purchaseCreditNoteService.delete(id),
  };

  // 3. Definimos las rutas para la navegación.
  //    Para crear una nueva nota, primero debemos seleccionar un proveedor.
  const routePaths = {
    new: '/compras/proveedores',
    edit: '/compras/editar-nota-credito', // Definimos la futura ruta de edición.
  };

  return (
    // Usamos la misma estructura de SubMenu y ViewContainer que en los otros módulos.
    <>
      <SubMenu links={purchasesSubMenuLinks} />
      <ViewContainer>
        {/* 4. Renderizamos el componente reutilizable con toda nuestra configuración. */}
        <DocumentListView
          pageTitle="Filtrar Notas de Crédito de Compra"
          listTitle="Notas de Crédito sobre Compras"
          queryKey="purchaseCreditNotes" // Clave única para React Query.
          documentService={serviceAdapter}
          routePaths={routePaths}
          newDocumentMessage="Redirigiendo para seleccionar un proveedor..."
          columns={creditNoteColumns}
          FilterComponent={DefaultFilterComponent}
          ActionsComponent={DefaultActionsComponent}
        />
      </ViewContainer>
    </>
  );
}