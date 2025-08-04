// src/components/reports/SalesReport.jsx

import React from 'react';
import { FaSearch, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { DocumentListView } from '../../shared/DocumentListView';
import { SaleService } from '../../../services/sales/SaleService';
import { formatDate } from '../../../utils/dateFormatter';
import SubMenu from "../SubMenu";
import styles from '../../../styles/shared/DocumentView.module.css';

// --- PASO 1: IMPORTAR LAS LIBRERÍAS DE EXPORTACIÓN ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importamos el plugin como una función
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


// --- INICIO DE LA CORRECCIÓN ---
// Usamos el mismo método robusto para obtener la fecha local de hoy.
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const today = `${year}-${month}-${day}`;
// --- FIN DE LA CORRECCIÓN ---



// Componente de filtros (sin cambios)
const ReportFilterComponent = ({ register, handleSubmit, onSearch, watch, handleClear }) => (
    <form onSubmit={handleSubmit(onSearch)}>
        <div className="row align-items-center">
        
        {/* Columna Izquierda para los 4 campos de input */}
        <div className="col">
            <div className="row mb-3">
            <div className="col"><label className="form-label fw-bold">Inicio:</label><input type="date" className="form-control" {...register("startDate")}  max={today} /></div>
            <div className="col"><label className="form-label fw-bold">Fin:</label><input type="date" className="form-control" {...register("endDate")}  max={today} /></div>
            </div>
            <div className="row">
            <div className="col"><label className="form-label fw-bold">Nombre:</label><input type="text" className="form-control" {...register("customerName")} placeholder="Filtrar por nombre"/></div>
            <div className="col"><label className="form-label fw-bold">Apellido:</label><input type="text" className="form-control" {...register("customerLastName")} placeholder="Filtrar por apellido"/></div>
            </div>
        </div>

        {/* Columna Derecha para el botón de búsqueda */}
        <div className="col-md-auto d-flex align-items-center justify-content-center ps-4">
           <div className="d-flex gap-2"> {/* Envolvemos los botones en un div con gap */}
          
          {/* 2. Añadimos el nuevo botón condicional "Limpiar Filtros" */}
          {/* Este botón solo aparecerá si ALGUNO de los campos de filtro tiene un valor */}
          {(watch("startDate") || watch("endDate") || watch("customerName") || watch("customerLastName")) && (
            <button
              type="button" // Importante: es de tipo 'button', no 'submit'
              className={styles.actionButton}
              onClick={handleClear} // Conectamos la función que viene del padre
            >
              Limpiar Filtros
            </button>
          )}

          <button type="submit" className={styles.actionButton} style={{ padding: '0.75rem 2rem' }}>
            <FaSearch className="me-2" />
            Buscar
          </button>
        </div>
        </div>

        </div>
    </form>
);

const ReportActionsAndTitleComponent = ({ listTitle, documents }) => {
  // --- CORRECCIÓN: Usamos un nombre de usuario de prueba ---
  // Cuando integres la lógica en AuthContext, solo cambiarás esta línea por:
  // const { userName } = useAuth();
  const userName = "Usuario de Prueba";

  const handleExportPDF = () => {
    if (!documents || documents.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape' });

   const pageWidth = doc.internal.pageSize.width;

    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;

    // --- CORRECCIÓN 2: Encabezado con diseño profesional (alineación mixta) ---
    
    // Lado izquierdo del encabezado
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("NubixConta S.A. de C.V.", margin, 22);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de Ventas", margin, 30);

    // Lado derecho del encabezado
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Generado por: ${userName}`, pageWidth - margin, 30, { align: 'right' });

    // --- CORRECCIÓN 3: Línea separadora ---
    doc.setDrawColor(189, 195, 199); // Un color gris suave
    doc.line(margin, 40, pageWidth - margin, 40);

    // --- AC02: Columnas y datos de la tabla ---
    const tableColumn = ["Fecha", "N° Documento", "Cliente", "Subtotal", "IVA", "Total", "Descripcion", "Días Crédito"];
    const tableRows = [];

    documents.forEach(sale => {
      const saleData = [
        formatDate(sale.issueDate),
        sale.documentNumber,
        `${sale.customer?.customerName || ''} ${sale.customer?.customerLastName || ''}`.trim(),
        `$${sale.subtotalAmount?.toFixed(2)}`,
        `$${sale.vatAmount?.toFixed(2)}`,
        `$${sale.totalAmount?.toFixed(2)}`,
        sale.saleDescription,
        sale.customer?.creditDay || '-',
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      headStyles: { fillColor: [34, 49, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const footerY = pageHeight - 15;
        doc.setFontSize(9);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
      },
    });
    
    doc.save('reporte_ventas.pdf');
  };

 const handleExportExcel = async () => { // La función ahora es async
    if (!documents || documents.length === 0) return;

    // 1. Crear un nuevo libro de trabajo y una hoja
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ventas");

    // 2. Añadir el encabezado fuera de la tabla
    worksheet.addRow(["NubixConta S.A. de C.V."]);
    worksheet.addRow(["Reporte de Ventas "]);
    worksheet.addRow([`Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]); // Fila vacía

    // Fusionar celdas del encabezado
    worksheet.mergeCells('A1:H1');
    worksheet.mergeCells('A2:H2');
    worksheet.mergeCells('A3:H3');
    
    // --- CORRECCIÓN: Centrado del encabezado de Excel ---
    // Aplicamos estilos de fuente y alineación a cada celda del encabezado
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.font = { size: 14 };
    subtitleCell.alignment = { horizontal: 'center' };
    
    const generatedByCell = worksheet.getCell('A3');
    generatedByCell.font = { size: 10 };
    generatedByCell.alignment = { horizontal: 'center' };
    

    // 3. Definir y añadir la fila de cabeceras de la tabla
    const headerRow = worksheet.addRow([
      'Fecha', 'Numero de Documento', 'Cliente', 'Descripción', 
      'Días de Crédito', 'Subtotal', 'IVA', 'Total'
    ]);
    
    // 4. Aplicar estilos a la fila de cabeceras (negrita, bordes, relleno)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF22313F' } // Color oscuro (mismo que el PDF)
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' } // Texto blanco
      };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // 5. Añadir los datos de las ventas y aplicarles bordes
    documents.forEach(doc => {
      const row = worksheet.addRow([
        formatDate(doc.issueDate),
        doc.documentNumber,
        `${doc.customer?.customerName || ''} ${doc.customer?.customerLastName || ''}`.trim(),
        doc.saleDescription,
        doc.customer?.creditDay || '-',
        doc.subtotalAmount,
        doc.vatAmount,
        doc.totalAmount
      ]);
      // Aplicar bordes a cada celda de la fila de datos
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      // Formatear celdas de moneda
      row.getCell(6).numFmt = '$#,##0.00';
      row.getCell(7).numFmt = '$#,##0.00';
      row.getCell(8).numFmt = '$#,##0.00';
    });

    // 6. Ajustar el ancho de las columnas
    worksheet.columns = [
      { width: 15 }, { width: 20 }, { width: 30 }, { width: 40 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    // 7. Escribir el buffer y guardarlo con file-saver
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'reporte_ventas.xlsx');
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="mb-0">{listTitle}</h3>
      <div className="d-flex align-items-center gap-3">
        <span className="fw-bold">Guardar como:</span>
        <button type="button" className={styles.exportButton} onClick={handleExportPDF} title="Exportar a PDF" disabled={!documents || documents.length === 0}>
          <FaFilePdf size="1.5em" />
        </button>
        <button type="button" className={styles.exportButton} onClick={handleExportExcel} title="Exportar a Excel" disabled={!documents || documents.length === 0}>
          <FaFileExcel size="1.5em" />
        </button>
      </div>
    </div>
  );
};

// --- AC02: Columnas de la tabla en pantalla ---
const reportColumns = [
    { header: 'Fecha', cell: (doc) => formatDate(doc.issueDate), style: { minWidth: '150px' }  },
    { header: 'N° de Documento', accessor: 'documentNumber', style: { minWidth: '130px' } },
    { header: 'Cliente', cell: (doc) => `${doc.customer?.customerName || ''} ${doc.customer?.customerLastName || ''}`.trim(), style: { minWidth: '250px' }, className: styles.textAlignLeft },
    { header: 'Subtotal', cell: (doc) => `$${doc.subtotalAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'IVA', cell: (doc) => `$${doc.vatAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'Total', cell: (doc) => `$${doc.totalAmount?.toFixed(2)}`, style: { minWidth: '150px' }, className: styles.textAlignRight },
    { header: 'Descripcion', accessor: 'saleDescription', style: { minWidth: '350px' }, className: styles.textAlignLeft },
    { header: 'Días de Crédito', cell: (doc) => doc.customer?.creditDay || '-' ,style: { minWidth: '150px' } },
];

export default function SalesReport() {
  const saleService = SaleService();
  const serviceAdapter = { search: (filters) => saleService.searchSalesByCriteria(filters) };

  return (
    <>
      <SubMenu />
      <DocumentListView
        pageTitle="Reporte de Ventas"
        listTitle="Ventas Filtradas"
        queryKey="salesReport"
        documentService={serviceAdapter}
        columns={reportColumns}
        FilterComponent={ReportFilterComponent}
        ActionsComponent={ReportActionsAndTitleComponent}
        initialFetchEnabled={false}
        showRowActions={false}
        emptyListMessage="Realice una búsqueda para ver los resultados."
      />
    </>
  );
}
