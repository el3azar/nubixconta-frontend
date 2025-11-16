// src/components/shared/AccountingReportActions.jsx
import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { Notifier } from '../../utils/alertUtils';
import { formatDate } from '../../utils/dateFormatter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from '../../styles/shared/DocumentView.module.css';

const AccountingReportActions = ({ reportData }) => {
  const { user } = useAuth();
  const { company } = useCompany();

  const userName = user?.sub || "Usuario";
  const companyName = company?.companyName || "Mi Empresa";

  const handleExportPDF = () => {
    if (!reportData || reportData.length === 0) { Notifier.warning("No hay datos para exportar."); return; }
    const toastId = Notifier.loading("Generando PDF...");
    setTimeout(() => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 14;

            doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(companyName, margin, 22);
            doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.text("Reporte: Libro Diario", margin, 30);
            doc.setFontSize(9);
            doc.text(`Generado por: ${userName}`, pageWidth - margin, 22, { align: 'right' });
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin, 30, { align: 'right' });
            doc.setDrawColor(189, 195, 199);
            doc.line(margin, 35, pageWidth - margin, 35);

            let finalY = 45;
            const groupedData = reportData.reduce((acc, mov) => { (acc[mov.documentId] = acc[mov.documentId] || []).push(mov); return acc; }, {});

            Object.values(groupedData).forEach(group => {
                const firstMov = group[0];
                doc.setFont("helvetica", "bold"); doc.setFontSize(10);
                doc.text(`Asiento Contable #${firstMov.documentId} - ${firstMov.documentType} - ${formatDate(firstMov.accountingDate)}`, margin, finalY);
                finalY += 7;

                const tableColumn = ["Cod. Cuenta", "Descripción", "Debe", "Haber"];
                const tableRows = group.map(mov => [ mov.idCatalog, mov.description, { content: `$${mov.debe.toFixed(2)}`, styles: { halign: 'right' } }, { content: `$${mov.haber.toFixed(2)}`, styles: { halign: 'right' } } ]);
                
                autoTable(doc, { 
                    head: [tableColumn], body: tableRows, startY: finalY, theme: 'grid', 
                    headStyles: { fillColor: [46, 44, 80] },
                    didDrawPage: (data) => {
                        const pageCount = doc.internal.getNumberOfPages();
                        doc.setFontSize(9);
                        doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                    }
                });
                finalY = doc.lastAutoTable.finalY + 10;
            });

            doc.save('reporte_libro_diario.pdf');
            Notifier.dismiss(toastId);
            // --- INICIO DE LA CORRECCIÓN DE UX ---
            Notifier.info("Tu descarga de PDF comenzará en breve.");
            // --- FIN DE LA CORRECCIÓN ---
        } catch (error) {
            Notifier.dismiss(toastId); Notifier.error("Ocurrió un error al generar el PDF.");
            console.error("Error en PDF:", error);
        }
    }, 50);
  };
  
  const handleExportExcel = async () => {
    if (!reportData || reportData.length === 0) { Notifier.warning("No hay datos para exportar."); return; }
    const toastId = Notifier.loading("Generando Excel...");
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Libro Diario");

        worksheet.addRow([companyName]);
        worksheet.addRow(["Reporte de Libro Diario"]);
        worksheet.addRow([`Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`]);
        worksheet.addRow([]);
        worksheet.mergeCells('A1:D1'); worksheet.mergeCells('A2:D2'); worksheet.mergeCells('A3:D3');
        worksheet.getCell('A1').font = { size: 16, bold: true }; worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.getCell('A2').font = { size: 14 }; worksheet.getCell('A2').alignment = { horizontal: 'center' };
        worksheet.getCell('A3').font = { size: 10 }; worksheet.getCell('A3').alignment = { horizontal: 'center' };
        
        const groupedData = reportData.reduce((acc, mov) => { (acc[mov.documentId] = acc[mov.documentId] || []).push(mov); return acc; }, {});

        Object.values(groupedData).forEach(group => {
            const firstMov = group[0];
            worksheet.addRow([]);
            const titleRow = worksheet.addRow([`Asiento Contable #${firstMov.documentId}`, firstMov.documentType, formatDate(firstMov.accountingDate)]);
            worksheet.mergeCells(titleRow.number, 1, titleRow.number, 4);
            titleRow.getCell(1).font = { bold: true }; titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E4EB' } };
            const headerRow = worksheet.addRow(["Cod. Cuenta", "Descripción", "Debe", "Haber"]);
            headerRow.font = { bold: true };
            group.forEach(mov => { const row = worksheet.addRow([mov.idCatalog, mov.description, mov.debe, mov.haber]); row.getCell(3).numFmt = '$#,##0.00'; row.getCell(4).numFmt = '$#,##0.00'; });
        });

        worksheet.columns = [{ width: 15 }, { width: 40 }, { width: 15 }, { width: 15 }];
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'reporte_libro_diario.xlsx');
        Notifier.dismiss(toastId);
        // --- INICIO DE LA CORRECCIÓN DE UX ---
        Notifier.info("Tu descarga de Excel comenzará en breve.");
        // --- FIN DE LA CORRECCIÓN ---
    } catch (error) {
        Notifier.dismiss(toastId); Notifier.error("No se pudo generar el archivo Excel.");
        console.error("Error en Excel:", error);
    }
  };

  return (
    <div className="row g-3 align-items-center justify-content-between">
      <div className="col-12 col-md-auto">
        {/* El título se maneja en el componente padre */}
      </div>
      <div className="col-12 col-md-auto">
        <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
          <span className="fw-bold">Guardar como:</span>
          <button type="button" className={styles.exportButton} onClick={handleExportPDF} disabled={!reportData || reportData.length === 0}>
            <FaFilePdf /> PDF
          </button>
          <button type="button" className={styles.exportButton} onClick={handleExportExcel} disabled={!reportData || reportData.length === 0}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountingReportActions;