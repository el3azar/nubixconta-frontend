import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../utils/dateFormatter'; // Reutilizamos el formateador

// La función ahora acepta 'user' y 'company' como nuevos parámetros
export const generateProductMovementsPDF = (fileName, movements, user, company) => {
  if (!movements || movements.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // --- ENCABEZADO PROFESIONAL (REPLICADO DE VENTAS) ---
  // Lado izquierdo
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(company?.companyName || "Mi Empresa S.A. de C.V.", margin, 22);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de Movimientos de Inventario", margin, 30);

  // Lado derecho
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });
  doc.text(`Generado por: ${user?.sub || 'Usuario'}`, pageWidth - margin, 30, { align: 'right' });

  // Línea separadora
  doc.setDrawColor(189, 195, 199);
  doc.line(margin, 40, pageWidth - margin, 40);

  // --- TABLA CON DATOS REALES Y COMPLETOS ---
  const tableColumn = [
    "Cód. Producto", "Nombre Producto", "Fecha", "Estado", "Tipo", "Cantidad",
    "Stock Resultante", "Descripción", "Cliente", "Módulo Origen"
  ];
  const tableRows = movements.map(mov => [
    mov.product.productCode,
    mov.product.productName,
    formatDate(mov.date),
    mov.status,
    mov.movementType,
    mov.quantity,
    mov.stockAfterMovement,
    mov.description,
    mov.customerName,
    mov.originModule,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    headStyles: { fillColor: [34, 49, 63], textColor: [255, 255, 255], fontStyle: 'bold'
      ,
            fontSize: 8, // Reduce el tamaño de fuente del encabezado
            cellPadding: 2 // Reduce el padding de las celdas
     },
     styles: {
            fontSize: 8, // Reduce el tamaño de fuente del cuerpo
            cellPadding: 2
        },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    },
  });
  
  doc.save(`${fileName}.pdf`);
};