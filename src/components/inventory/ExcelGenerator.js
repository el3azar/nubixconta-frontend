import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generateProductMovementsExcel = (fileName, movements) => {
  // Mapeamos los datos a un formato plano
  const data = movements.map((m) => ({
    Correlativo: m.correlativo,
    Código: m.codigoProducto,
    Nombre: m.nombreProducto,
    Unidad: m.unidad,
    Fecha: m.fecha,
    Tipo: m.tipoMovimiento,
    Observación: m.observacion,
    Módulo: m.modulo
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(blob, `${fileName}.xlsx`);
};
