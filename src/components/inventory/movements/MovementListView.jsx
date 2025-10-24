import React, {useState, useMemo } from 'react';
import { useMovementLogic } from '../../../hooks/useMovementLogic'; // ¡REUTILIZAMOS EL MISMO HOOK!
import Boton from '../inventoryelements/Boton';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import TableComponent from '../inventoryelements/TableComponent';
//import { showInputDialog } from '../alertsmodalsa';
import { Notifier } from '../../../utils/alertUtils';
import { generateProductMovementsPDF } from '../PdfGenerator';
import { generateProductMovementsExcel } from '../ExcelGenerator';
import SearchCardMovement from '../inventoryelements/SearchCardMovement'; // Usamos el mismo SearchCard
import { formatDate } from '../../../utils/dateFormatter'; // Reutilizamos el formateador
import { useAuth } from '../../../context/AuthContext'; // ¡IMPORTAMOS EL HOOK DE AUTENTICACIÓN!
import { useCompany } from '../../../context/CompanyContext'; // ¡IMPORTAMOS EL HOOK DE EMPRESA!
import SubMenu from "../../shared/SubMenu";
import { inventorySubMenuLinks } from '../../../config/menuConfig';

const MovementListView = () => {
  // --- 1. Obtenemos la lógica y los datos del hook compartido ---
  const { movimientos:movimientosBase, isLoading, isError, error, searchProps } = useMovementLogic();

  // --- OBTENEMOS LOS DATOS DEL USUARIO Y LA EMPRESA ---
  const { user } = useAuth();
  const { company } = useCompany();

  // --- 2. ¡NUEVO! Estado para el filtro de tipo de origen (Manual/Automático) ---
  const [originFilter, setOriginFilter] = useState(null); // null = Todos, 'Manual', 'Automatico'

// --- 3. ¡NUEVO! Lógica de filtrado específica para esta vista de reportes ---
  const movimientosDeReporte = useMemo(() => {
    return movimientosBase
      // Primero, filtramos para quedarnos SOLO con los movimientos APLICADOS
      .filter(mov => mov.status === 'APLICADA')
      // Luego, aplicamos el filtro de origen si está activo
      .filter(mov => {
        if (!originFilter) return true; // Si no hay filtro, mostrar todos
        const isManual = mov.originModule.includes('Manual');
        if (originFilter === 'Manual') return isManual;
        if (originFilter === 'Automatico') return !isManual;
        return true;
      });
  }, [movimientosBase, originFilter]); // Se recalcula si cambian los datos base o el filtro de origen


  // --- 4. La lógica específica de esta vista (reportes) se queda aquí ---
  const handleGenerateExcel = async () => {
    const result = await Notifier.input({
      title: 'Nombre del Archivo',
      inputLabel: 'Ingresa el nombre para tu reporte de Excel:',
      placeholder: 'Ej: Reporte_Movimientos_Enero'
    });
    if (result.isConfirmed && result.value) {
      generateProductMovementsExcel(result.value, movimientosDeReporte, user, company);
      Notifier.success('Reporte de Excel generado con éxito.');
    }
  };

  const handleGeneratePdf = async () => {
    const result = await Notifier.input({
      title: 'Nombre del Archivo',
      inputLabel: 'Ingresa el nombre para tu reporte PDF:',
      placeholder: 'Ej: Reporte_Movimientos_Enero'
    });
    if (result.isConfirmed && result.value) {
      generateProductMovementsPDF(result.value, movimientosDeReporte, user, company);
      Notifier.success('Reporte PDF generado con éxito.');
    }
  };

  // --- 5. La definición de columnas es específica de esta vista (SIN ACCIONES) ---
  const columns = useMemo(() => [
    { header: 'Cód. Producto', accessorKey: 'product.productCode' },
    { header: 'Nombre Producto', accessorKey: 'product.productName' },
    { header: 'Fecha', cell: ({ row }) => formatDate(row.original.date) },
    { header: 'Estado', accessorKey: 'status' },
    { header: 'Tipo', accessorKey: 'movementType' },
    { header: 'Cantidad', accessorKey: 'quantity' },
    { header: 'Stock Resultante', accessorKey: 'stockAfterMovement' },
    { header: 'Descripción', accessorKey: 'description' },
     { 
      header: 'Cliente', 
      accessorKey: 'customerName',
      cell: ({ row }) => row.original.customerName || '-',
    },
    { 
      header: 'Proveedor', 
      accessorKey: 'supplierName',
      cell: ({ row }) => row.original.supplierName || '-',
    },
    { header: 'Módulo Origen', accessorKey: 'originModule' },
    { header: 'Documento Origen', accessorKey: 'originDocument' },
  ], []);

  if (isLoading) return <p className="text-center">Cargando movimientos...</p>;
  if (isError) return <p className="text-center text-danger">Error: {error.message}</p>;

  return (
    <>
     <SubMenu links={inventorySubMenuLinks} />
      <div>
        <h2>Reporte de Movimientos de Inventario</h2>
        {/* Reutilizamos el mismo SearchCard con las mismas props */}
        <SearchCardMovement tamano='tamano-grande' {...searchProps} />

      {/* Los botones de acción son específicos de esta vista */}
        <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
        {/* Lado Izquierdo: Nuevos botones de filtro por origen */}
        <div className="d-flex gap-2 flex-wrap mb-2 mb-md-0">
            <Boton color={!originFilter ? 'morado' : 'blanco'} forma="pastilla" onClick={() => setOriginFilter(null)}>
                Todos
            </Boton>
            <Boton color={originFilter === 'Manual' ? 'morado' : 'blanco'} forma="pastilla" onClick={() => setOriginFilter('Manual')}>
                Solo Manuales
            </Boton>
            <Boton color={originFilter === 'Automatico' ? 'morado' : 'blanco'} forma="pastilla" onClick={() => setOriginFilter('Automatico')}>
                Solo Automáticos
            </Boton>
        </div>

        {/* Lado Derecho: Botones de generación de reportes */}
        <div className="d-flex gap-2 flex-wrap">
          <Boton color="morado" forma="pastilla" onClick={handleGeneratePdf}>
            Generar Reporte en PDF
            <BsFileEarmarkPdf size={19} className='ms-2'/>
          </Boton>
          <Boton color="morado" forma="pastilla" onClick={handleGenerateExcel}>
            Generar Reporte en Excel
            <BsFileEarmarkExcel size={19} className='ms-2'/>
          </Boton>
        </div>
      </div>
      
      
      {/* Reutilizamos la misma tabla, pero sin colores de fila y con las columnas de reporte */}
      <TableComponent
        columns={columns}
        data={movimientosDeReporte}
        withPagination={true}
        pageSize={20}
      />
    </div>
  </>  
  );
}; 

export default MovementListView;