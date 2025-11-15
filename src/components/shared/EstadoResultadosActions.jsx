import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { Notifier } from '../../utils/alertUtils';
import { formatDate, formatCurrency } from '../../utils/dateFormatter';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import reportStyles from '../../styles/shared/DocumentView.module.css';

const EstadoResultadosActions = ({ reportData, filters }) => {
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
                const margin = 15;
                const pageWidth = doc.internal.pageSize.width;
                const colConcept = margin;
                const colTotal = pageWidth - margin;
                let y = 15;

                const printHeader = () => {
                    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(companyName, pageWidth / 2, y, { align: 'center' }); y += 7;
                    doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.text("Estado de Resultados", pageWidth / 2, y, { align: 'center' }); y += 6;
                    doc.setFontSize(10); doc.text(`Del ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`, pageWidth / 2, y, { align: 'center' }); y += 12;
                    doc.setDrawColor(30); doc.line(margin, y, pageWidth - margin, y); y += 8;
                };

                const printSectionTitle = (title) => {
                    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
                    doc.text(title, colConcept, y); y += 7;
                };
                
                const printLine = (label, amount) => {
                    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
                    doc.text(label, colConcept + 5, y);
                    doc.text(formatCurrency(amount), colTotal, y, { align: 'right' }); y += 6;
                };
                
                const printTotal = (label, amount, hasTopLine = true) => {
                    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
                    const amountText = formatCurrency(amount);
                    const textWidth = doc.getTextWidth(amountText);
                    if (hasTopLine) {
                        doc.setDrawColor(150);
                        doc.line(colTotal - textWidth - 1, y - 2, colTotal, y - 2); 
                    }
                    doc.text(label, colConcept, y);
                    doc.text(amountText, colTotal, y, { align: 'right' }); y += 8;
                };

                const printSubtotal = (label, amount) => {
                    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
                    doc.text(label, colConcept, y);
                    doc.text(formatCurrency(amount), colTotal, y, { align: 'right' }); y += 10;
                };
                
                // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
                const printFinalResult = (label, amount) => {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11); // Tamaño consistente
                    
                    const amountText = formatCurrency(amount);
                    const textWidth = doc.getTextWidth(amountText);
                    doc.setDrawColor(30);

                    // Se calcula la posición de la línea INFERIOR
                    const bottomLineY = y + 2.5;
                    
                    // Se dibuja ÚNICAMENTE la línea inferior
                    doc.line(colTotal - textWidth - 2, bottomLineY, colTotal, bottomLineY);
                    
                    // Opcional: Si quieres una LÍNEA DOBLE, descomenta la siguiente línea
                    // doc.line(colTotal - textWidth - 2, bottomLineY + 0.5, colTotal, bottomLineY + 0.5);

                    doc.text(label, colConcept, y);
                    doc.text(amountText, colTotal, y, { align: 'right' });
                    y += 8;
                };
                // --- FIN DE LA CORRECCIÓN DEFINITIVA ---

                // Build PDF Document
                printHeader();
                printSectionTitle("Ingresos de Operación");
                reportData.ingresosOperacionales.forEach(item => printLine(`${item.accountCode} - ${item.accountName}`, item.totalPeriodo));
                printTotal("Total Ingresos", reportData.totalIngresosOperacionales);
                printSectionTitle("(-) Costo de Venta");
                reportData.costoVenta.forEach(item => printLine(`${item.accountCode} - ${item.accountName}`, -item.totalPeriodo));
                printTotal("Total Costo de Venta", -reportData.totalCostoVenta);
                printSubtotal("= UTILIDAD BRUTA", reportData.utilidadBruta);
                printSectionTitle("(-) Gastos de Operación");
                reportData.gastosVenta.forEach(g => printLine(`${g.accountCode} - ${g.accountName}`, -g.totalPeriodo));
                reportData.gastosAdministracion.forEach(g => printLine(`${g.accountCode} - ${g.accountName}`, -g.totalPeriodo));
                printTotal("Total Gastos de Operación", -reportData.totalGastosOperacionales);
                printSubtotal("= UTILIDAD DE OPERACIÓN", reportData.utilidadOperacional);
                printTotal("(+) Otros Ingresos", reportData.totalOtrosIngresos, false);
                printTotal("(-) Otros Gastos", -reportData.totalOtrosGastos, false);
                printSubtotal("= UTILIDAD ANTES DE RESERVA E IMPUESTO", reportData.utilidadAntesImpuestos);
                printTotal("(-) Reserva Legal", -reportData.reservaLegal, false);
                printTotal("(-) Impuesto Sobre la Renta", -reportData.impuestoSobreLaRenta, false);
                printFinalResult("= UTILIDAD DEL EJERCICIO", reportData.utilidadDelEjercicio);

                doc.save('estado_resultados.pdf');
                Notifier.dismiss(toastId); Notifier.info("Tu descarga de PDF comenzará en breve.");
            } catch (e) { Notifier.dismiss(toastId); Notifier.error("Ocurrió un error al generar el PDF."); console.error(e); }
        }, 50);
    };

    const handleExportExcel = async () => {
        if (!reportData) { Notifier.warning("No hay datos para exportar."); return; }
        const toastId = Notifier.loading("Generando Excel...");
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estado de Resultados");

            const addStyledRow = (values, { bold = false, indent = 0, bgColor = null, color = null, border = null }) => {
                const row = worksheet.addRow(values);
                row.font = { bold, color: color ? { argb: color } : null };
                if (indent > 0) row.getCell(1).alignment = { indent };
                row.getCell(2).numFmt = '$#,##0.00;[Red]-$#,##0.00';
                row.getCell(3).numFmt = '$#,##0.00;[Red]-$#,##0.00';
                if (bgColor) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                if (border) {
                    const targetCell = values.length > 2 ? row.getCell(3) : row.getCell(2);
                    targetCell.border = border === 'double'
                        ? { top: { style: 'thin' }, bottom: { style: 'double' } }
                        : { top: { style: 'thin' } };
                }
                return row;
            };
            
            worksheet.mergeCells('A1:C1'); worksheet.getCell('A1').value = companyName; worksheet.getCell('A1').font = { size: 16, bold: true }; worksheet.getCell('A1').alignment = { horizontal: 'center' };
            worksheet.mergeCells('A2:C2'); worksheet.getCell('A2').value = "Estado de Resultados"; worksheet.getCell('A2').font = { size: 14 }; worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.mergeCells('A3:C3'); worksheet.getCell('A3').value = `Del ${formatDate(filters.startDate)} al ${formatDate(filters.endDate)}`; worksheet.getCell('A3').alignment = { horizontal: 'center' };
            worksheet.addRow([]);

            addStyledRow(['Ingresos de Operación'], { bold: true });
            reportData.ingresosOperacionales.forEach(i => addStyledRow([`${i.accountCode} - ${i.accountName}`, i.totalPeriodo], { indent: 2 }));
            addStyledRow(['Total Ingresos', '', reportData.totalIngresosOperacionales], { bold: true, border: 'double' });
            
            addStyledRow(['(-) Costo de Venta'], { bold: true });
            reportData.costoVenta.forEach(c => addStyledRow([`${c.accountCode} - ${c.accountName}`, c.totalPeriodo], { indent: 2 }));
            addStyledRow(['Total Costo de Venta', '', reportData.totalCostoVenta], { bold: true, border: 'single' });

            addStyledRow(['= UTILIDAD BRUTA', '', reportData.utilidadBruta], { bold: true, bgColor: 'FFE6E4EB' });

            // --- INICIO DE LA CORRECCIÓN DE SINTAXIS ---
            addStyledRow(['(-) Gastos de Operación'], { bold: true });
            if (reportData.gastosVenta && reportData.gastosVenta.length > 0) {
                addStyledRow(['  Gastos de Venta'], { bold: true, indent: 1 });
                reportData.gastosVenta.forEach(g => addStyledRow([`${g.accountCode} - ${g.accountName}`, g.totalPeriodo], { indent: 2 }));
            }
            if (reportData.gastosAdministracion && reportData.gastosAdministracion.length > 0) {
                addStyledRow(['  Gastos de Administración'], { bold: true, indent: 1 });
                reportData.gastosAdministracion.forEach(g => addStyledRow([`${g.accountCode} - ${g.accountName}`, g.totalPeriodo], { indent: 2 }));
            }
            addStyledRow(['Total Gastos de Operación', '', reportData.totalGastosOperacionales], { bold: true, border: 'single' });
            // --- FIN DE LA CORRECCIÓN DE SINTAXIS ---

            addStyledRow(['= UTILIDAD DE OPERACIÓN', '', reportData.utilidadOperacional], { bold: true, bgColor: 'FFE6E4EB' });

            addStyledRow(['(+) Otros Ingresos', '', reportData.totalOtrosIngresos], { bold: true });
            addStyledRow(['(-) Otros Gastos', '', reportData.totalOtrosGastos], { bold: true });
            
            addStyledRow(['= UTILIDAD ANTES DE RESERVA E IMPUESTO', '', reportData.utilidadAntesImpuestos], { bold: true, bgColor: 'FFE6E4EB' });

            addStyledRow(['(-) Reserva Legal', '', reportData.reservaLegal], { bold: true });
            addStyledRow(['(-) Impuesto Sobre la Renta', '', reportData.impuestoSobreLaRenta], { bold: true });

            addStyledRow(['= UTILIDAD DEL EJERCICIO', '', reportData.utilidadDelEjercicio], { bold: true, bgColor: 'FF10031C', color: 'FFFFFFFF', border: 'double' });
            
            worksheet.columns = [{ width: 60 }, { width: 20 }, { width: 20 }];
            
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'estado_resultados.xlsx');
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

export default EstadoResultadosActions;