import React, { useState, useEffect } from 'react';
import {
  FaSearch, FaPlusCircle, FaEye, FaPen, FaTrashAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../../../styles/sales/Sales.module.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { SaleService } from '../../../services/sales/SaleService';
import { DocumentListView } from '../../shared/DocumentListView';
import SubMenu from "../SubMenu";
import { CreditNoteService } from '../../../services/sales/CreditNoteService';


export default function CreditNote() {
  const creditNoteService = CreditNoteService();

  // El "Adaptador" traduce los nombres de funciones de CreditNoteService
  // a los nombres genéricos que espera DocumentListView.
  const serviceAdapter = {
    getAll: (sortBy) => creditNoteService.getAllCreditNotes(sortBy),
    searchByDate: (filters) => creditNoteService.searchByDateAndStatus(filters),
    approve: (id) => creditNoteService.applyCreditNote(id),
    cancel: (id) => creditNoteService.cancelCreditNote(id),
    delete: (id) => creditNoteService.deleteCreditNote(id),
  };

  // Rutas específicas para este módulo
  const routePaths = {
    new: '/ventas/clientes', // Apunta a la ruta futura
    edit: '/ventas/editar-nota-credito',
    view: '/notas-credito/ver',
  };

  return (
    <>
      <SubMenu />
      <DocumentListView
        documentType="Nota de Crédito"
        queryKey="creditNotes" // Clave única para el caché de TanStack
        documentService={serviceAdapter}
        routePaths={routePaths}
        newDocumentMessage="Redirigiendo para seleccionar un cliente..."
      />
    </>
  );
}