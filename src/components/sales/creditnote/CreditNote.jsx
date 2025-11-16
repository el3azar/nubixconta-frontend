// src/components/sales/creditnote/CreditNote.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import SubMenu from "../../shared/SubMenu"; 
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';
import viewStyles from '../../../styles/shared/DocumentView.module.css';
import { salesSubMenuLinks } from '../../../config/menuConfig';

// Configuración de columnas específica para Notas de Crédito
const creditNoteColumns = [
  { header: 'Correlativo', accessor: 'idNotaCredit', style: { minWidth: '100px' } },
  { header: 'N° Doc.', accessor: 'documentNumber', style: { minWidth: '130px' } },
  { header: 'Fecha', cell: (doc) => formatDate(doc.creditNoteDate || doc.issueDate), style: { minWidth: '140px' } },
  { header: 'Estado', accessor: 'creditNoteStatus', style: { minWidth: '110px' } },
  { header: 'Cliente', cell: (doc) => doc.sale?.customer?.customerName || 'N/A', style: { minWidth: '250px' },className: viewStyles.textAlignLeft },
  { header: 'Días Crédito', cell: (doc) => doc.sale?.customer?.creditDay || '-', style: { minWidth: '120px' } },
  // Columna condicional que existía antes
  { header: 'Venta Afectada', cell: (doc) => doc.sale?.documentNumber || 'N/A', style: { minWidth: '150px' } },
  { header: 'Descripción', accessor: 'description',style: { minWidth: '350px' },className: viewStyles.textAlignLeft },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' } },
];

export default function CreditNote() {
  const creditNoteService = CreditNoteService();

  const serviceAdapter = {
    getAll: (sortBy) => creditNoteService.getAllCreditNotes(sortBy),
    search: (filters) => {
      // El adaptador traduce los nombres de filtros si es necesario
      const correctFilters = { start: filters.startDate, end: filters.endDate };
      return creditNoteService.searchByDateAndStatus(correctFilters);
    },
    approve: (id) => creditNoteService.applyCreditNote(id),
    cancel: (id) => creditNoteService.cancelCreditNote(id),
    delete: (id) => creditNoteService.deleteCreditNote(id),
  };

  const routePaths = {
    new: '/ventas/clientes',
    edit: '/ventas/editar-nota-credito',
    view: '/notas-credito/asiento-contable',
  };

  return (
    <>
      <SubMenu links={salesSubMenuLinks} />
      <DocumentListView
        pageTitle="Filtrar Notas de Crédito"
        listTitle="Notas de Crédito"
        queryKey="creditNotes"
        documentService={serviceAdapter}
        routePaths={routePaths}
        newDocumentMessage="Redirigiendo para seleccionar un cliente..."
        // --- PROPS NUEVAS ---
        columns={creditNoteColumns}
        FilterComponent={DefaultFilterComponent}
        ActionsComponent={DefaultActionsComponent}
        showLegend={true} 
      />
    </>
  );
}