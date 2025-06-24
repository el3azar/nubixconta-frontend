import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProductMovementsPDF = (fileName, movements) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Lista de Movimientos de Productos', 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [[
      'Correlativo', 'Código', 'Nombre', 'Unidad',
      'Fecha', 'Tipo', 'Observación', 'Módulo'
    ]],
    body: movements.map(m => [
      m.correlativo,
      m.codigoProducto,
      m.nombreProducto,
      m.unidad,
      m.fecha,
      m.tipoMovimiento,
      m.observacion,
      m.modulo
    ]),
    styles: {
      fontSize: 9,
      halign: 'center',
    },
    headStyles: {
      fillColor: [44, 62, 80], // color oscuro
    }
  });

  doc.save(`${fileName}.pdf`);
};
