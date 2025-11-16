// src/components/purchases/reports/PurchasesReport.jsx

import React from 'react';
import { FaSearch, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { DocumentListView } from '../../shared/DocumentListView';
import { usePurchaseService } from '../../../services/purchases/PurchaseService'; // ADAPTACIÓN
import { formatDate } from '../../../utils/dateFormatter';
import SubMenu from "../../shared/SubMenu"; 
import styles from '../../../styles/shared/DocumentView.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useCompany } from '../../../context/CompanyContext'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ViewContainer from '../../shared/ViewContainer';
import { Notifier } from '../../../utils/alertUtils';
import { purchasesSubMenuLinks } from '../../../config/menuConfig'; // ADAPTACIÓN

// Lógica para obtener la fecha actual (sin cambios)
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const today = `${year}-${month}-${day}`;

// ADAPTACIÓN: Componente de filtro para Compras
const PurchasesFilterComponent = ({ register, handleSubmit, onSearch, watch, handleClear }) => (
    <form onSubmit={handleSubmit(onSearch)}>
        <div className={styles.filter}>
            <div className="row g-3">
                <div className="col-12 col-lg-9">
                    <div className="row g-3">
                        <div className="col-12 col-md-6"><label className="form-label fw-bold">Inicio:</label><input type="date" className="form-control" {...register("startDate")} max={today} /></div>
                        <div className="col-12 col-md-6"><label className="form-label fw-bold">Fin:</label><input type="date" className="form-control" {...register("endDate")} max={today} /></div>
                        {/* ADAPTACIÓN: Campos de búsqueda para proveedor */}
                        <div className="col-12 col-md-6"><label className="form-label fw-bold">Nombre Proveedor:</label><input type="text" className="form-control" {...register("supplierName")} placeholder="Filtrar por nombre"/></div>
                        <div className="col-12 col-md-6"><label className="form-label fw-bold">Apellido Proveedor:</label><input type="text" className="form-control" {...register("supplierLastName")} placeholder="Filtrar por apellido"/></div>
                    </div>
                </div>
                <div className="col-12 col-lg-3 d-flex align-items-center">
                    <div className="d-flex flex-column gap-2 w-100 align-items-center">
                      <button type="submit" className={styles.actionButton}>
                        <FaSearch className="me-2" /> Buscar
                      </button>
                      {/* ADAPTACIÓN: Observar los campos correctos */}
                      {(watch("startDate") || watch("endDate") || watch("supplierName") || watch("supplierLastName")) && (
                      <button type="button" className={styles.actionButton} onClick={handleClear}>
                        Limpiar Filtros
                      </button>
                      )}
                    </div>
                </div>
            </div>
        </div>
    </form>
);

// ADAPTACIÓN: Componente de acciones y exportación para Compras
const PurchasesActionsAndTitleComponent = ({ listTitle, documents }) => {
  const { user } = useAuth();
  const { company } = useCompany();

  const userName = user?.sub || "Usuario...";
  const companyName = company?.companyName || "Mi Empresa S.A. de C.V.";

  const handleExportPDF = () => {
    if (!documents || documents.length === 0) {
      Notifier.warning("No hay datos para exportar.");
      return;
    }
    const loadingToastId = Notifier.loading("Generando PDF...");

     setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.width;
        const margin = 14;

        // Encabezado (idéntico al de ventas)
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(companyName, margin, 22);
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Reporte de Compras", margin, 30); // ADAPTACIÓN
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });
        doc.text(`Generado por: ${userName}`, pageWidth - margin, 30, { align: 'right' });
        doc.setDrawColor(189, 195, 199);
        doc.line(margin, 40, pageWidth - margin, 40);

        // ADAPTACIÓN: Columnas y datos de la tabla de compras
        const tableColumn = ["Fecha", "N° Documento", "Proveedor", "Subtotal", "IVA", "Total", "Descripcion", "Días Crédito"];
        const tableRows = [];

        documents.forEach(purchase => {
          const purchaseData = [
            formatDate(purchase.issueDate),
            purchase.documentNumber,
            `${purchase.supplier?.supplierName || ''} ${purchase.supplier?.supplierLastName || ''}`.trim(),
            `$${purchase.subtotalAmount?.toFixed(2)}`,
            `$${purchase.vatAmount?.toFixed(2)}`,
            `$${purchase.totalAmount?.toFixed(2)}`,
            purchase.purchaseDescription,
            purchase.supplier?.creditDay || '-',
          ];
          tableRows.push(purchaseData);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 45,
          headStyles: { fillColor: [34, 49, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - data.settings.margin.right, doc.internal.pageSize.height - 15, { align: 'right' });
          },
        });
        
        doc.save('reporte_compras.pdf'); // ADAPTACIÓN
        Notifier.dismiss(loadingToastId);
        Notifier.info("Tu descarga de PDF comenzará en breve.");
      } catch (e) {
        Notifier.dismiss(loadingToastId);
        Notifier.error("No se pudo generar el PDF.");
      }
    }, 50);
  };

  const handleExportExcel = async () => {
    if (!documents || documents.length === 0) {
      Notifier.warning("No hay datos para exportar.");
      return;
    }
    const loadingToastId = Notifier.loading("Generando Excel...");
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Compras"); // ADAPTACIÓN

        // Encabezado (idéntico)
        worksheet.addRow([companyName]);
        worksheet.addRow(["Reporte de Compras"]); // ADAPTACIÓN
        worksheet.addRow([`Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`]);
        worksheet.addRow([]);
        worksheet.mergeCells('A1:H1');
        worksheet.mergeCells('A2:H2');
        worksheet.mergeCells('A3:H3');
        const titleCell = worksheet.getCell('A1');
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.font = { size: 14 };
        subtitleCell.alignment = { horizontal: 'center' };
        const generatedByCell = worksheet.getCell('A3');
        generatedByCell.font = { size: 10 };
        generatedByCell.alignment = { horizontal: 'center' };

        // ADAPTACIÓN: Cabeceras de la tabla
        const headerRow = worksheet.addRow([
          'Fecha', 'Numero de Documento', 'Proveedor', 'Descripción', 
          'Días de Crédito', 'Subtotal', 'IVA', 'Total'
        ]);
        
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22313F' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // ADAPTACIÓN: Añadir datos de las compras
        documents.forEach(doc => {
          const row = worksheet.addRow([
            formatDate(doc.issueDate),
            doc.documentNumber,
            `${doc.supplier?.supplierName || ''} ${doc.supplier?.supplierLastName || ''}`.trim(),
            doc.purchaseDescription,
            doc.supplier?.creditDay || '-',
            doc.subtotalAmount,
            doc.vatAmount,
            doc.totalAmount
          ]);
          row.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });
          row.getCell(6).numFmt = '$#,##0.00';
          row.getCell(7).numFmt = '$#,##0.00';
          row.getCell(8).numFmt = '$#,##0.00';
        });

        worksheet.columns = [
          { width: 15 }, { width: 20 }, { width: 30 }, { width: 40 },
          { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'reporte_compras.xlsx'); // ADAPTACIÓN

        Notifier.dismiss(loadingToastId);
        Notifier.info("Tu descarga de Excel comenzará en breve.");
    } catch (e) {
      Notifier.dismiss(loadingToastId);
      Notifier.error("No se pudo generar el archivo Excel.");
    }
  };

  // El JSX del componente es idéntico al de ventas
  return (
    <div className="row g-3 align-items-center justify-content-between">
        <div className="col-12 col-md-auto">
            <h3 className="mb-0 text-center text-md-start">{listTitle}</h3>
        </div>
        <div className="col-12 col-md-auto">
            <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
                <span className="fw-bold">Guardar como:</span>
                <button type="button" className={styles.exportButton} onClick={handleExportPDF} title="Exportar a PDF" disabled={!documents || documents.length === 0}>
                   <FaFilePdf className="me-2" /> PDF
                </button>
                <button type="button" className={styles.exportButton} onClick={handleExportExcel} title="Exportar a Excel" disabled={!documents || documents.length === 0}>
                    <FaFileExcel className="me-2" /> Excel
                </button>
            </div>
        </div>
    </div>
  );
};

// ADAPTACIÓN: Columnas de la tabla en pantalla para Compras
const purchasesReportColumns = [
    { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate), style: { minWidth: '150px' } },
    { header: 'N° Doc.', accessor: 'documentNumber', style: { minWidth: '130px' } },
    { header: 'Proveedor', cell: (doc) => `${doc.supplier?.supplierName || ''} ${doc.supplier?.supplierLastName || ''}`.trim(), style: { minWidth: '250px' }, className: styles.textAlignLeft },
    { header: 'Subtotal', cell: (doc) => `$${doc.subtotalAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'IVA', cell: (doc) => `$${doc.vatAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'Descripcion', accessor: 'purchaseDescription', style: { minWidth: '350px' }, className: styles.textAlignLeft },
    { header: 'Días de Crédito', cell: (doc) => doc.supplier?.creditDay || '-', style: { minWidth: '150px' } },
];

// ADAPTACIÓN: Componente principal `PurchasesReport`
export default function PurchasesReport() {
  const purchaseService = usePurchaseService();
  const serviceAdapter = { search: (filters) => purchaseService.searchPurchasesByCriteria(filters) };

  return (
    <div>
      <SubMenu links={purchasesSubMenuLinks} />
      <ViewContainer>
      <DocumentListView
        pageTitle="Reporte de Compras"
        listTitle="Compras Filtradas"
        queryKey="purchasesReport"
        documentService={serviceAdapter}
        columns={purchasesReportColumns}
        FilterComponent={PurchasesFilterComponent}
        ActionsComponent={PurchasesActionsAndTitleComponent}
        initialFetchEnabled={false}
        showRowActions={false}
        emptyListMessage="Realice una búsqueda para ver los resultados."
      />
   </ViewContainer>
    </div>
  );
}