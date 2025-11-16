// src/components/shared/BalanceGeneralActions.jsx
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

const BalanceGeneralActions = ({ reportData, filters }) => {
    const { user } = useAuth();
    const { company } = useCompany();
    const userName = user?.sub || "Usuario";
    const companyName = company?.companyName || "Mi Empresa";

    const handleExportPDF = () => {
        if (!reportData) { Notifier.warning("No hay datos para exportar."); return; }
        const toastId = Notifier.loading("Generando PDF...");

        setTimeout(() => {
            try {
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.width;
                const margin = 15;
                let y = 15;
                
                // --- INICIO DE LA CORRECCIÓN: Encabezado PDF completo ---
                // Títulos centrados
                doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(companyName, pageWidth / 2, y, { align: 'center' }); y += 7;
                doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.text("Estado de Situación Financiera", pageWidth / 2, y, { align: 'center' }); y += 6;
                doc.setFontSize(10); doc.text(`Al ${formatDate(filters.endDate)}`, pageWidth / 2, y, { align: 'center' });
                
                // Información de generación (a la derecha)
                doc.setFontSize(9);
                doc.text(`Generado por: ${userName}`, pageWidth - margin, 22, { align: 'right' });
                doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin, 28, { align: 'right' });
                
                y += 8; // Espacio antes de la tabla
                // --- FIN DE LA CORRECCIÓN ---

                const body = [];
                const addRow = (code, concept, detail, total, styles = {}) => {
                    body.push([
                        { content: code, styles: { fontStyle: styles.bold ? 'bold' : 'normal', ...styles } },
                        { content: concept, styles: { fontStyle: styles.bold ? 'bold' : 'normal', ...styles } },
                        { content: detail !== null ? formatCurrency(detail) : '', styles: { halign: 'right', ...styles } },
                        { content: total !== null ? formatCurrency(total) : '', styles: { halign: 'right', fontStyle: 'bold', ...styles } },
                    ]);
                };

                // Construcción del Cuerpo del Reporte (sin cambios)
                addRow('', 'ACTIVO', null, null, { bold: true, fillColor: '#f0eefc' });
                addRow('', 'ACTIVO CORRIENTE', null, null, { bold: true, cellPadding: { left: 5 } });
                reportData.activoCorriente.cuentas.forEach(c => addRow(c.accountCode, c.accountName, c.saldoFinal, null, { cellPadding: { left: 10 } }));
                addRow('', 'TOTAL ACTIVO CORRIENTE', null, reportData.activoCorriente.subtotal, { bold: true, cellPadding: { left: 5 } });
                addRow('', 'ACTIVO NO CORRIENTE', null, null, { bold: true, cellPadding: { left: 5 } });
                reportData.activoNoCorriente.cuentas.forEach(c => addRow(c.accountCode, c.accountName, c.saldoFinal, null, { cellPadding: { left: 10 } }));
                addRow('', 'TOTAL ACTIVO NO CORRIENTE', null, reportData.activoNoCorriente.subtotal, { bold: true, cellPadding: { left: 5 } });
                addRow('', 'TOTAL ACTIVO', null, reportData.totalActivos, { bold: true, fontSize: 11, fillColor: '#e9ecef' });
                addRow('', '', null, null, {});
                addRow('', 'PASIVO Y PATRIMONIO', null, null, { bold: true, fillColor: '#f0eefc' });
                addRow('', 'PASIVO CORRIENTE', null, null, { bold: true, cellPadding: { left: 5 } });
                reportData.pasivoCorriente.cuentas.forEach(c => addRow(c.accountCode, c.accountName, c.saldoFinal, null, { cellPadding: { left: 10 } }));
                addRow('', 'TOTAL PASIVO CORRIENTE', null, reportData.pasivoCorriente.subtotal, { bold: true, cellPadding: { left: 5 } });
                addRow('', 'PASIVO NO CORRIENTE', null, null, { bold: true, cellPadding: { left: 5 } });
                reportData.pasivoNoCorriente.cuentas.forEach(c => addRow(c.accountCode, c.accountName, c.saldoFinal, null, { cellPadding: { left: 10 } }));
                addRow('', 'TOTAL PASIVO NO CORRIENTE', null, reportData.pasivoNoCorriente.subtotal, { bold: true, cellPadding: { left: 5 } });
                addRow('', 'TOTAL PASIVO', null, reportData.totalPasivos, { bold: true, fontSize: 11, fillColor: '#e9ecef' });
                addRow('', '', null, null, {});
                addRow('', 'PATRIMONIO', null, null, { bold: true, cellPadding: { left: 5 } });
                reportData.patrimonio.cuentas.forEach(c => addRow(c.accountCode, c.accountName, c.saldoFinal, null, { cellPadding: { left: 10 } }));
                addRow('', 'TOTAL PATRIMONIO', null, reportData.patrimonio.subtotal, { bold: true, cellPadding: { left: 5 } });
                addRow('', '', null, null, {});
                addRow('', 'TOTAL PASIVO Y PATRIMONIO', null, reportData.totalPasivoYPatrimonio, { bold: true, fontSize: 11, fillColor: '#e9ecef' });
                
                autoTable(doc, {
                    startY: y, // Se usa la 'y' actualizada después del encabezado
                    head: [['Código', 'Concepto', 'Detalle', 'Total']],
                    body: body,
                    theme: 'plain',
                    headStyles: { fontStyle: 'bold', fillColor: '#f0eefc', textColor: '#10031C' },
                    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 35 }, 3: { cellWidth: 35 } }
                });

                doc.save('balance_general.pdf');
                Notifier.dismiss(toastId); Notifier.info("Tu descarga de PDF comenzará en breve.");
            } catch (e) { Notifier.dismiss(toastId); Notifier.error("Ocurrió un error al generar el PDF."); console.error(e); }
        }, 50);
    };

    const handleExportExcel = async () => {
        if (!reportData) { Notifier.warning("No hay datos para exportar."); return; }
        const toastId = Notifier.loading("Generando Excel...");
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Balance General");

            const addRow = (values, { bold = false, indent = 0, bgColor = null, color = null, border = false }) => {
                const row = worksheet.addRow(values);
                row.font = { bold, color: color ? { argb: color } : null };
                row.getCell(2).alignment = { indent };
                [row.getCell(3), row.getCell(4)].forEach(cell => cell.numFmt = '$#,##0.00');
                if (bgColor) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                if (border) row.getCell(4).border = { top: { style: 'thin' }, bottom: { style: 'double' } };
                return row;
            };

            // --- INICIO DE LA CORRECCIÓN: Encabezado Excel completo ---
            worksheet.mergeCells('A1:D1'); worksheet.getCell('A1').value = companyName; worksheet.getCell('A1').font = { size: 16, bold: true }; worksheet.getCell('A1').alignment = { horizontal: 'center' };
            worksheet.mergeCells('A2:D2'); worksheet.getCell('A2').value = "Estado de Situación Financiera"; worksheet.getCell('A2').font = { size: 14 }; worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.mergeCells('A3:D3'); worksheet.getCell('A3').value = `Al ${formatDate(filters.endDate)}`; worksheet.getCell('A3').alignment = { horizontal: 'center' };
            worksheet.mergeCells('A4:D4'); worksheet.getCell('A4').value = `Generado por: ${userName} | Fecha: ${new Date().toLocaleDateString()}`; worksheet.getCell('A4').alignment = { horizontal: 'center' };
            worksheet.addRow([]);
            // --- FIN DE LA CORRECCIÓN ---

            // Cuerpo del Reporte (sin cambios)
            addRow(['', 'ACTIVO'], { bold: true, bgColor: 'FFF0EEFC' });
            addRow(['', 'ACTIVO CORRIENTE'], { bold: true, indent: 1 });
            reportData.activoCorriente.cuentas.forEach(c => addRow([c.accountCode, c.accountName, c.saldoFinal], { indent: 2 }));
            addRow(['', 'TOTAL ACTIVO CORRIENTE', '', reportData.activoCorriente.subtotal], { bold: true, indent: 1 });
            addRow(['', 'ACTIVO NO CORRIENTE'], { bold: true, indent: 1 });
            reportData.activoNoCorriente.cuentas.forEach(c => addRow([c.accountCode, c.accountName, c.saldoFinal], { indent: 2 }));
            addRow(['', 'TOTAL ACTIVO NO CORRIENTE', '', reportData.activoNoCorriente.subtotal], { bold: true, indent: 1 });
            addRow(['', 'TOTAL ACTIVO', '', reportData.totalActivos], { bold: true, bgColor: 'FFE6E4EB', border: true });
            worksheet.addRow([]);
            addRow(['', 'PASIVO Y PATRIMONIO'], { bold: true, bgColor: 'FFF0EEFC' });
            addRow(['', 'PASIVO CORRIENTE'], { bold: true, indent: 1 });
            reportData.pasivoCorriente.cuentas.forEach(c => addRow([c.accountCode, c.accountName, c.saldoFinal], { indent: 2 }));
            addRow(['', 'TOTAL PASIVO CORRIENTE', '', reportData.pasivoCorriente.subtotal], { bold: true, indent: 1 });
            addRow(['', 'PASIVO NO CORRIENTE'], { bold: true, indent: 1 });
            reportData.pasivoNoCorriente.cuentas.forEach(c => addRow([c.accountCode, c.accountName, c.saldoFinal], { indent: 2 }));
            addRow(['', 'TOTAL PASIVO NO CORRIENTE', '', reportData.pasivoNoCorriente.subtotal], { bold: true, indent: 1 });
            addRow(['', 'TOTAL PASIVO', '', reportData.totalPasivos], { bold: true, bgColor: 'FFE6E4EB' });
            worksheet.addRow([]);
            addRow(['', 'PATRIMONIO'], { bold: true, indent: 1 });
            reportData.patrimonio.cuentas.forEach(c => addRow([c.accountCode, c.accountName, c.saldoFinal], { indent: 2 }));
            addRow(['', 'TOTAL PATRIMONIO', '', reportData.patrimonio.subtotal], { bold: true, indent: 1 });
            addRow(['', 'TOTAL PASIVO Y PATRIMONIO', '', reportData.totalPasivoYPatrimonio], { bold: true, bgColor: 'FFE6E4EB', border: true });
            
            worksheet.columns = [{ width: 20 }, { width: 50 }, { width: 20 }, { width: 20 }];
            
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'balance_general.xlsx');
            Notifier.dismiss(toastId); Notifier.info("Tu descarga de Excel comenzará en breve.");
        } catch (e) { Notifier.dismiss(toastId); Notifier.error("No se pudo generar el Excel."); console.error(e); }
    };

    return (
        <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
            <span className="fw-bold" style={{ color: '#10031C' }}>Guardar como:</span>
            <button type="button" className={reportStyles.exportButton} onClick={handleExportPDF} disabled={!reportData}>
                <FaFilePdf className="me-2" /> PDF
            </button>
            <button type="button" className={reportStyles.exportButton} onClick={handleExportExcel} disabled={!reportData}>
                <FaFileExcel className="me-2" /> Excel
            </button>
        </div>
    );
};

export default BalanceGeneralActions;