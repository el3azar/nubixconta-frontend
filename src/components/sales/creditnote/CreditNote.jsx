// src/components/sales/creditnote/CreditNote.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import SubMenu from "../SubMenu";
import { CreditNoteService } from '../../../services/sales/CreditNoteService';
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import { formatDate } from '../../../utils/dateFormatter';

// Configuración de columnas específica para Notas de Crédito
const creditNoteColumns = [
  { header: 'Correlativo', accessor: 'idNotaCredit' },
  { header: 'N° Doc.', accessor: 'documentNumber' },
  { header: 'Fecha', cell: (doc) => formatDate(doc.creditNoteDate || doc.issueDate) },
  { header: 'Estado', accessor: 'creditNoteStatus' },
  { header: 'Cliente', cell: (doc) => doc.sale?.customer?.customerName || 'N/A' },
  { header: 'Días Crédito', cell: (doc) => doc.sale?.customer?.creditDay || '-' },
  // Columna condicional que existía antes
  { header: 'Venta Afectada', cell: (doc) => doc.sale?.documentNumber || 'N/A' },
  { header: 'Descripción', accessor: 'description' },
  { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}` },
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
    view: '/notas-credito/ver',
  };

  return (
    <>
      <SubMenu />
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
      />
    </>
  );
}