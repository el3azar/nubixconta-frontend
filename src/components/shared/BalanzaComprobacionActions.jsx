// src/components/shared/BalanzaComprobacionActions.jsx
import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { Notifier } from '../../utils/alertUtils';
import { formatDate, formatCurrency } from '../../utils/dateFormatter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import reportStyles from '../../styles/shared/DocumentView.module.css';

const BalanzaComprobacionActions = ({ reportData, totals, filters }) => {
  const { user } = useAuth();
  const { company } = useCompany();
  const userName = user?.sub || "Usuario";
  const companyName = company?.companyName || "Mi Empresa";

  const handleExportPDF = () => {
    if (!reportData || reportData.length === 0) { Notifier.warning("No hay datos para exportar."); return; }
    const toastId = Notifier.loading("Generando PDF...");
    
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;

        // Encabezado del documento
        doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(companyName, margin, 15);
        doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.text("Balanza de Comprobación", margin, 22);
        doc.setFontSize(10); doc.text(`Período: ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`, margin, 29);
        doc.setFontSize(9);
        doc.text(`Generado por: ${userName}`, pageWidth - margin, 15, { align: 'right' });
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });
        doc.setDrawColor(189, 195, 199); doc.line(margin, 35, pageWidth - margin, 35);

        // Definición de la tabla (cabecera, cuerpo y pie)
        const head = [
            [{ content: 'Cuenta', colSpan: 2, styles: { halign: 'center' } }, { content: 'Saldos Iniciales', colSpan: 2, styles: { halign: 'center' } }, { content: 'Movimientos del Período', colSpan: 2, styles: { halign: 'center' } }, { content: 'Saldos Finales', colSpan: 2, styles: { halign: 'center' } }],
            ['Código', 'Nombre', 'Deudor', 'Acreedor', 'Debe', 'Haber', 'Deudor', 'Acreedor']
        ];
        const body = reportData.map(line => [
            line.accountCode,
            { content: line.accountName, styles: { cellWidth: 'auto' } },
            { content: formatCurrency(line.saldoInicialDeudor), styles: { halign: 'right' } },
            { content: formatCurrency(line.saldoInicialAcreedor), styles: { halign: 'right' } },
            { content: formatCurrency(line.totalDebePeriodo), styles: { halign: 'right' } },
            { content: formatCurrency(line.totalHaberPeriodo), styles: { halign: 'right' } },
            { content: formatCurrency(line.saldoFinalDeudor), styles: { halign: 'right' } },
            { content: formatCurrency(line.saldoFinalAcreedor), styles: { halign: 'right' } }
        ]);
        const foot = [[
            { content: 'SUMAS IGUALES', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.saldoInicialDeudor), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.saldoInicialAcreedor), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.totalDebePeriodo), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.totalHaberPeriodo), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.saldoFinalDeudor), styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(totals.saldoFinalAcreedor), styles: { halign: 'right', fontStyle: 'bold' } },
        ]];

        autoTable(doc, {
            head, body, foot, startY: 40, theme: 'grid',
            headStyles: { fillColor: [46, 44, 80], halign: 'center', fontSize: 8 },
            footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontSize: 8 },
            styles: { fontSize: 8 },
            columnStyles: { 1: { cellWidth: 50 } }, // Ancho para el nombre de la cuenta
            didDrawPage: (data) => {
                doc.setFontSize(9);
                doc.text(`Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }
        });

        doc.save('balanza_comprobacion.pdf');
        Notifier.dismiss(toastId); Notifier.info("Tu descarga de PDF comenzará en breve.");
      } catch (e) { Notifier.dismiss(toastId); Notifier.error("Ocurrió un error al generar el PDF."); console.error(e); }
    }, 50);
  };

  const handleExportExcel = async () => {
    if (!reportData || reportData.length === 0) { Notifier.warning("No hay datos para exportar."); return; }
    const toastId = Notifier.loading("Generando Excel...");

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Balanza de Comprobación");

        // Encabezado del archivo
        worksheet.addRow([companyName]).getCell(1).font = { size: 16, bold: true, color: { argb: 'FF10031C' } };
        worksheet.addRow(["Balanza de Comprobación"]).getCell(1).font = { size: 14 };
        worksheet.addRow([`Período: ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`]);
        worksheet.addRow([`Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`]);
        worksheet.mergeCells('A1:H1'); worksheet.mergeCells('A2:H2'); worksheet.mergeCells('A3:H3'); worksheet.mergeCells('A4:H4');
        worksheet.eachRow(row => row.alignment = { horizontal: 'center' });
        worksheet.addRow([]);

        // Cabecera de la tabla (Nivel 1)
        const headerRow1 = worksheet.addRow(['Cuenta', '', 'Saldos Iniciales', '', 'Movimientos del Período', '', 'Saldos Finales', '']);
        worksheet.mergeCells('A6:B6'); worksheet.mergeCells('C6:D6'); worksheet.mergeCells('E6:F6'); worksheet.mergeCells('G6:H6');

        // Cabecera de la tabla (Nivel 2)
        const headerRow2 = worksheet.addRow(['Código', 'Nombre', 'Deudor', 'Acreedor', 'Debe', 'Haber', 'Deudor', 'Acreedor']);

        // Estilos para las cabeceras
        [headerRow1, headerRow2].forEach(row => {
            row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            row.alignment = { horizontal: 'center', vertical: 'middle' };
            row.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10031C' } };
            });
        });

        // Cuerpo de la tabla
        reportData.forEach(line => {
            const row = worksheet.addRow([
                line.accountCode, line.accountName, line.saldoInicialDeudor, line.saldoInicialAcreedor,
                line.totalDebePeriodo, line.totalHaberPeriodo, line.saldoFinalDeudor, line.saldoFinalAcreedor
            ]);
            // Aplicar formato de moneda y alineación a la derecha
            for (let i = 3; i <= 8; i++) {
                row.getCell(i).numFmt = '$#,##0.00';
                row.getCell(i).alignment = { horizontal: 'right' };
            }
        });

        // Pie de la tabla (Totales)
        const footerRow = worksheet.addRow([
            'SUMAS IGUALES', '', totals.saldoInicialDeudor, totals.saldoInicialAcreedor,
            totals.totalDebePeriodo, totals.totalHaberPeriodo, totals.saldoFinalDeudor, totals.saldoFinalAcreedor
        ]);
        worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
        footerRow.font = { bold: true };
        footerRow.getCell(1).alignment = { horizontal: 'right' };
        footerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E4EB' } };
        });
        for (let i = 3; i <= 8; i++) {
            footerRow.getCell(i).numFmt = '$#,##0.00';
            footerRow.getCell(i).alignment = { horizontal: 'right' };
        }

        // Ancho de columnas
        worksheet.columns = [
            { width: 15 }, { width: 45 }, { width: 18 }, { width: 18 },
            { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }
        ];

        // Generar y descargar el archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'balanza_comprobacion.xlsx');

        Notifier.dismiss(toastId); Notifier.info("Tu descarga de Excel comenzará en breve.");
    } catch (e) { Notifier.dismiss(toastId); Notifier.error("No se pudo generar el archivo Excel."); console.error(e); }
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
      <span className="fw-bold" style={{ color: '#10031C' }}>Guardar como:</span>
      <button type="button" className={reportStyles.exportButton} onClick={handleExportPDF} disabled={!reportData || reportData.length === 0}>
        <FaFilePdf className="me-2" /> PDF
      </button>
      <button type="button" className={reportStyles.exportButton} onClick={handleExportExcel} disabled={!reportData || reportData.length === 0}>
        <FaFileExcel className="me-2" /> Excel
      </button>
    </div>
  );
};

export default BalanzaComprobacionActions;