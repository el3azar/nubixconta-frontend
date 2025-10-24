import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../utils/dateFormatter';

// La función ahora acepta 'user' y 'company'
export const generateProductMovementsExcel = async (fileName, movements, user, company) => {
  if (!movements || movements.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Movimientos");

  // --- ENCABEZADO PROFESIONAL (REPLICADO DE VENTAS) ---
  worksheet.addRow([company?.companyName || "Mi Empresa S.A. de C.V."]);
  worksheet.addRow(["Reporte de Movimientos de Inventario"]);
  worksheet.addRow([`Generado por: ${user?.sub || 'Usuario'} | Fecha: ${new Date().toLocaleDateString()}`]);
  worksheet.addRow([]);

  // Se ajusta el rango de fusión al nuevo número de columnas
  worksheet.mergeCells('A1:L1');
  worksheet.mergeCells('A2:L2');
  worksheet.mergeCells('A3:L3');
  
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  worksheet.getCell('A2').font = { size: 14 };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };
  worksheet.getCell('A3').font = { size: 10 };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  // --- CABECERAS DE LA TABLA CON ESTILO ---
  const headerRow = worksheet.addRow([
    "Cód. Producto", "Nombre Producto", "Fecha", "Estado", "Tipo", "Cantidad",
    "Stock Resultante", "Descripción", "Cliente", "Proveedor", "Módulo Origen", "Doc. Origen"
  ]);

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22313F' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // --- DATOS DE LA TABLA ---
  movements.forEach(mov => {
    const row = worksheet.addRow([
      mov.product.productCode,
      mov.product.productName,
      formatDate(mov.date),
      mov.status,
      mov.movementType,
      mov.quantity,
      mov.stockAfterMovement,
      mov.description,
      mov.customerName || '-',
      mov.supplierName || '-',
      mov.originModule || '-',
      mov.originDocument || '-',
    ]);
    row.eachCell((cell) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  // --- INICIO DE LA CORRECCIÓN: Anchos ajustados al orden de TUS cabeceras ---
  worksheet.columns = [
    { width: 15 }, // Cód. Producto
    { width: 35 }, // Nombre Producto
    { width: 15 }, // Fecha
    { width: 12 }, // Estado
    { width: 12 }, // Tipo
    { width: 10 }, // Cantidad
    { width: 18 }, // Stock Resultante
    { width: 40 }, // Descripción
    { width: 30 }, // Cliente
    { width: 30 }, // Proveedor
    { width: 25 }, // Módulo Origen
    { width: 20 }  // Doc. Origen
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};