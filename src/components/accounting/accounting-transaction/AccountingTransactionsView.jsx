import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { useAccountingTransactionService } from '../../../services/accounting/AccountingService';
import SubMenu from "../../shared/SubMenu";
// --- INICIO DE LA CORRECCIÓN: Usamos los componentes por defecto ---
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
// --- FIN DE LA CORRECCIÓN ---
import { formatDate } from '../../../utils/dateFormatter';
import ViewContainer from '../../shared/ViewContainer';
import { accountingSubMenuLinks } from '../../../config/menuConfig';
import viewStyles from '../../../styles/shared/DocumentView.module.css';

const transactionColumns = [
  { header: 'ID', accessor: 'id', style: { minWidth: '80px' } },
  { header: 'Fecha', cell: (doc) => formatDate(doc.transactionDate), style: { minWidth: '120px' } },
  { header: 'Estado', accessor: 'status', style: { minWidth: '120px' } },
  { header: 'Concepto', accessor: 'description', style: { minWidth: '400px' }, className: viewStyles.textAlignLeft },
  { header: 'Total Debe', cell: (doc) => `$${doc.totalDebe?.toFixed(2)}`, style: { minWidth: '150px' } },
  { header: 'Total Haber', cell: (doc) => `$${doc.totalHaber?.toFixed(2)}`, style: { minWidth: '150px' } },
];

export default function AccountingTransactionsView() {
  const transactionService = useAccountingTransactionService();

  const serviceAdapter = {
    getAll: (sortBy) => transactionService.getAll(sortBy),
    search: (filters) => transactionService.search(filters),
    approve: (id) => transactionService.approve(id),
    cancel: (id) => transactionService.cancel(id),
    delete: (id) => transactionService.delete(id),
  };

  const routePaths = {
    new: '/contabilidad/transacciones/nueva',
    edit: '/contabilidad/transacciones/editar',
  };

  return (
    <div>
      <SubMenu links={accountingSubMenuLinks} />
      <ViewContainer>
        {/* --- INICIO DE LA CORRECCIÓN: La configuración ahora es idéntica a Purchases.jsx --- */}
        <DocumentListView
          pageTitle="Filtrar Transacciones Contables"
          listTitle="Transacciones Contables"
          queryKey="accountingTransactions"
          documentService={serviceAdapter}
          routePaths={routePaths}
          newDocumentMessage="Creando nueva transacción contable..."
          columns={transactionColumns}
          FilterComponent={DefaultFilterComponent}      // Se usa el filtro de fechas estándar
          ActionsComponent={DefaultActionsComponent}    // Se usan las acciones estándar (Nuevo, Ordenar)
          initialFetchEnabled={true}
          showLegend={true} 
        />
        {/* --- FIN DE LA CORRECCIÓN --- */}
      </ViewContainer>
    </div>
  );
}