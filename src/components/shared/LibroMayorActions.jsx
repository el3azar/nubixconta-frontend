// src/components/shared/LibroMayorActions.jsx
import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { Notifier } from '../../utils/alertUtils';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/dateFormatter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from '../../styles/shared/DocumentView.module.css';

const LibroMayorActions = ({ reportData, filters }) => {
  const { user } = useAuth();
  const { company } = useCompany();

  const userName = user?.sub || "Usuario";
  const companyName = company?.companyName || "Mi Empresa";

  const handleExportPDF = () => {
    // ... (La lógica del PDF no cambia)
    if (!reportData || reportData.length === 0) {
      Notifier.warning("No hay datos para exportar.");
      return;
    }
    const toastId = Notifier.loading("Generando PDF...");
    
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 14;

        doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(companyName, margin, 22);
        doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.text("Reporte: Libro Mayor", margin, 30);
        if (filters.startDate) {
            doc.setFontSize(10);
            doc.text(`Período: ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`, margin, 38);
        }
        doc.setFontSize(9);
        doc.text(`Generado por: ${userName}`, pageWidth - margin, 22, { align: 'right' });
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin, 30, { align: 'right' });
        doc.setDrawColor(189, 195, 199);
        doc.line(margin, 45, pageWidth - margin, 45);

        let finalY = 50;

        reportData.forEach(cuenta => {
          if (finalY > pageHeight - 40) {
            doc.addPage();
            finalY = margin;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(`${cuenta.accountCode} - ${cuenta.accountName}`, margin, finalY);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Total Debe: ${formatCurrency(cuenta.totalDebe)}`, pageWidth / 2, finalY, { align: 'left' });
          doc.text(`Total Haber: ${formatCurrency(cuenta.totalHaber)}`, pageWidth / 2 + 60, finalY, { align: 'left' });
          doc.text(`Saldo del Período: ${formatCurrency(cuenta.saldoPeriodo)}`, pageWidth - margin, finalY, { align: 'right' });

          finalY += 8;

          const tableColumn = ["Fecha", "Documento", "Descripción", "Debe", "Haber"];
          const tableRows = cuenta.movimientos.map(mov => [
            formatDateTime(mov.accountingDate),
            `${mov.documentType} #${mov.documentId}`,
            mov.description,
            { content: formatCurrency(mov.debe), styles: { halign: 'right' } },
            { content: formatCurrency(mov.haber), styles: { halign: 'right' } }
          ]);
          
          autoTable(doc, { 
              head: [tableColumn], body: tableRows, startY: finalY, theme: 'grid', 
              headStyles: { fillColor: [46, 44, 80] },
              didDrawPage: (data) => {
                  const pageCount = doc.internal.getNumberOfPages();
                  doc.setFontSize(9);
                  doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
              }
          });
          finalY = doc.lastAutoTable.finalY + 15;
        });

        doc.save('reporte_libro_mayor.pdf');
        Notifier.dismiss(toastId);
        Notifier.info("Tu descarga de PDF comenzará en breve.");
      } catch (error) {
        Notifier.dismiss(toastId);
        Notifier.error("Ocurrió un error al generar el PDF.");
        console.error("Error en PDF:", error);
      }
    }, 50);
  };
  
  const handleExportExcel = async () => {
    if (!reportData || reportData.length === 0) {
      Notifier.warning("No hay datos para exportar.");
      return;
    }
    const toastId = Notifier.loading("Generando Excel...");
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Libro Mayor");

        worksheet.addRow([companyName]);
        worksheet.addRow(["Reporte de Libro Mayor"]);
        worksheet.addRow([`Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`]);
        if (filters.startDate) {
          worksheet.addRow([`Período: ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`]);
        }
        worksheet.addRow([]);
        worksheet.mergeCells('A1:G1'); worksheet.mergeCells('A2:G2'); worksheet.mergeCells('A3:G3'); worksheet.mergeCells('A4:G4');
        worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF10031C' } }; worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.getCell('A2').font = { size: 14 }; worksheet.getCell('A2').alignment = { horizontal: 'center' };
        
        reportData.forEach(cuenta => {
            worksheet.addRow([]);
            const titleRow = worksheet.addRow([`${cuenta.accountCode} - ${cuenta.accountName}`]);
            worksheet.mergeCells(titleRow.number, 1, titleRow.number, 7);
            titleRow.font = { bold: true, size: 12, color: { argb: 'FF10031C' } };
            
            // --- INICIO DE LA CORRECIÓN: Color de fondo más suave para la cabecera ---
            titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1C4E9' } };
            // --- FIN DE LA CORRECCIÓN ---
            worksheet.addRow(['', '', 'Total Debe:', cuenta.totalDebe, 'Total Haber:', cuenta.totalHaber, 'Saldo:']);
            const totalsRow = worksheet.lastRow;
            totalsRow.font = { bold: true };
            totalsRow.getCell(4).numFmt = '$#,##0.00';
            totalsRow.getCell(6).numFmt = '$#,##0.00';
            
            const headerRow = worksheet.addRow(["Fecha", "Tipo Documento", "# Documento", "Descripción", "Debe", "Haber"]);
            headerRow.font = { bold: true };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E4EB' } };

            cuenta.movimientos.forEach(mov => { 
                const row = worksheet.addRow([formatDateTime(mov.accountingDate), mov.documentType, mov.documentId, mov.description, mov.debe, mov.haber]);
                row.getCell(5).numFmt = '$#,##0.00';
                row.getCell(6).numFmt = '$#,##0.00';
            });
        });

        worksheet.columns = [{ width: 22 }, { width: 20 }, { width: 15 }, { width: 45 }, { width: 18 }, { width: 18 }];
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'reporte_libro_mayor.xlsx');
        Notifier.dismiss(toastId);
        Notifier.info("Tu descarga de Excel comenzará en breve.");
    } catch (error) {
        Notifier.dismiss(toastId);
        Notifier.error("No se pudo generar el archivo Excel.");
        console.error("Error en Excel:", error);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
      <span className="fw-bold" style={{ color: '#10031C' }}>Guardar como:</span>
      <button type="button" className={styles.exportButton} onClick={handleExportPDF} disabled={!reportData || reportData.length === 0}>
        <FaFilePdf className="me-2" /> PDF
      </button>
      <button type="button" className={styles.exportButton} onClick={handleExportExcel} disabled={!reportData || reportData.length === 0}>
        <FaFileExcel className="me-2" /> Excel
      </button>
    </div>
  );
};

export default LibroMayorActions;