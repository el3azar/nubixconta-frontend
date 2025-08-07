import { useState, useMemo, useCallback } from 'react';
import Boton from '../inventoryelements/Boton';
import { Link } from 'react-router-dom';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import TableComponent from '../inventoryelements/TableComponent';
import { showInputDialog } from '../alertsmodalsa';
import { generateProductMovementsPDF } from '../PdfGenerator';
import { generateProductMovementsExcel } from '../ExcelGenerator';

// 1. Importa el componente de la tarjeta de búsqueda
import SearchCardMovementList from '../inventoryelements/SearchCardMovementList';
import { format } from 'date-fns';

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

// Define datos de ejemplo para los Selects (simulando datos de una API)
const apiDataCodigo = [
  { value: 'SKU-000', label: 'SKU-000' },
  { value: 'SKU-001', label: 'SKU-001' },
  { value: 'SKU-002', label: 'SKU-002' },
];
const apiDataTipoMovimiento = [
  { value: 'Entrada', label: 'Entrada' },
  { value: 'Salida', label: 'Salida' },
  { value: 'Ajuste', label: 'Ajuste' },
];

const MovementListView = () => {

    // Estado para los datos y el filtro
  const [movimientos, setMovimientos] = useState(datosDeMovimientos);
  const [filtro, setFiltro] = useState(''); // Filtro global de la tabla

  // Estados para los filtros de la tarjeta de búsqueda
  const [codigoValue, setCodigoValue] = useState(null);
  const [tipoMovimientoValue, setTipoMovimientoValue] = useState(null);
  const [dateRange, setDateRange] = useState(undefined);

  // Lógica para manejar el filtrado del card de búsqueda
    const handleBuscar = useCallback(() => {
        const { from, to } = dateRange || {};

        const filteredData = datosDeMovimientos.filter(mov => {
            const matchCodigo = codigoValue ? mov.codigoProducto === codigoValue.value : true;
            const matchTipoMovimiento = tipoMovimientoValue ? mov.tipo === tipoMovimientoValue.value : true;

            // Lógica de filtrado por fecha
            const matchFecha = from && to ? new Date(mov.fecha) >= from && new Date(mov.fecha) <= to : true;

            return matchCodigo && matchTipoMovimiento && matchFecha;
        });

        setMovimientos(filteredData);
    }, [codigoValue, tipoMovimientoValue, dateRange]);

    // Lógica para limpiar los filtros del card de busqueda
    const handleLimpiar = () => {
        setCodigoValue(null);
        setTipoMovimientoValue(null);
        setDateRange(undefined);
        setMovimientos(datosDeMovimientos); // Restaura los datos originales
    };

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
            {/* Inserta el componente SearchCardMovementList aquí */}
            <SearchCardMovementList
                apiDataCodigo={apiDataCodigo}
                codigoValue={codigoValue}
                onCodigoChange={setCodigoValue}
                
                apiDataTipoMovimiento={apiDataTipoMovimiento}
                tipoMovimientoValue={tipoMovimientoValue}
                onTipoMovimientoChange={setTipoMovimientoValue}
                
                dateRange={dateRange}
                onDateRangeChange={setDateRange}

                onBuscar={handleBuscar}
                onLimpiar={handleLimpiar}
            />
            <div className='row align-items-center justify-content-end'>
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