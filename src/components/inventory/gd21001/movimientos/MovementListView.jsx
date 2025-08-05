import { useState, useMemo, useCallback } from 'react';
import Boton from '../elementos/Boton';
import { Link } from 'react-router-dom';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import TableComponent from '../elementos/TableComponent';
import { showInputDialog } from '../alertsmodalsa';
import { generateProductMovementsPDF } from '../../PdfGenerator';
import { generateProductMovementsExcel } from '../../ExcelGenerator';

// 2. Define los datos de ejemplo para la tabla de movimientos
const datosDeMovimientos = [
  { codigoProducto: 'SKU-000', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-001', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-002', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-003', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
  { codigoProducto: 'SKU-004', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-005', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-006', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-007', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
  { codigoProducto: 'SKU-008', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-009', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-010', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-011', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
  { codigoProducto: 'SKU-012', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-013', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-014', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-015', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
  { codigoProducto: 'SKU-016', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-017', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-018', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-019', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
  { codigoProducto: 'SKU-020', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario' },
  { codigoProducto: 'SKU-021', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas' },
  { codigoProducto: 'SKU-022', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario' },
  { codigoProducto: 'SKU-023', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas' },
];

const MovementListView = () => {

    // Estado para los datos y el filtro
  const [movimientos, setMovimientos] = useState(datosDeMovimientos);
  const [filtro, setFiltro] = useState('');

  // Dentro de tu componente MovementListView

    const handleGenerateExcel = async () => {
    // 1. Llama a tu servicio para mostrar el diálogo con input.
    const result = await showInputDialog(
        'Nombre del Archivo', 
        'Ingresa el nombre para tu reporte de Excel:'
    );

    // 2. Verifica si el usuario confirmó y escribió un nombre.
    if (result.isConfirmed && result.value) {
        const fileName = result.value; // El nombre que el usuario escribió.
        
        // 3. Llama a tu función para generar el Excel.
        // Le pasas el nombre del archivo y los datos actuales de la tabla.
        generateProductMovementsExcel(fileName, movimientos);
    }
    };

    // --- NUEVA FUNCIÓN PARA PDF ---
  const handleGeneratePdf = async () => {
    const result = await showInputDialog('Nombre del Archivo', 'Ingresa el nombre para tu reporte PDF:');
    if (result.isConfirmed && result.value) {
      // Llama a la función (ya corregida) para generar el PDF
      generateProductMovementsPDF(result.value, movimientos);
    }
  };

  // 3. Define las columnas para la tabla de movimientos
  const columns = useMemo(() => [
    {
      header: 'Código de Producto',
      accessorKey: 'codigoProducto',
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha',
    },
    {
      header: 'Tipo de Movimiento',
      accessorKey: 'tipo',
    },
    {
      header: 'Observación',
      accessorKey: 'observacion',
    },
    {
      header: 'Módulo',
      accessorKey: 'modulo',
    },
  ], []);

    return (
        <div>
            <h2>Lista de Movimientos</h2>
            <div className='row align-items-center justify-content-between'>
                <div className="col-auto">
                    <Link to="/inventario/moves">
                        <Boton color="morado" forma="pastilla" className="mb-4" >
                            <i class="bi bi-arrow-right-circle-fill me-2"></i>
                            Gestionar Movimientos de Inventario
                        </Boton>
                    </Link>
                </div>
                
                <div className="col-auto">
                    <div className="d-flex gap-2">
                        <Boton 
                            color="morado" 
                            forma="pastilla" 
                            className="mb-4" 
                            onClick={handleGeneratePdf}>
                            Generar Reporte enPDF
                            <BsFileEarmarkPdf size={19} className='ms-2'/>
                        </Boton>
                        <Boton 
                            color="morado" 
                            forma="pastilla" 
                            className="mb-4" 
                            onClick={handleGenerateExcel}>
                            Generar Reporte en Excel
                            <BsFileEarmarkExcel size={19} className='ms-2'/>
                        </Boton>
                    </div>
                </div>
            </div>

            {/* 4. Usa tu componente BaseTable y pásale las props */}
            <TableComponent
                columns={columns}
                data={movimientos}
                globalFilter={filtro}
                onGlobalFilterChange={setFiltro}
                withPagination={true}
                pageSize={20}
            />
        </div>
    )
}; 

export default MovementListView;