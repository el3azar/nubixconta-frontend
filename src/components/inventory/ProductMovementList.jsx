import React, { useState } from 'react';
import ProductMovementTable from './ProductMovementTable';
import ExcelReport from './ExcelReport';
import PdfReport from './PdfReport';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import { generateProductMovementsPDF } from './PdfGenerator';
import { generateProductMovementsExcel } from './ExcelGenerator';

const ProductMovementList = () => {
  const [nameFilter, setNameFilter] = useState('');
  const [nameOrder, setNameOrder] = useState(null);
  const [dateOrder, setDateOrder] = useState(null);

  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const mockMovements = [
    {
      correlativo: '1A',
      codigoProducto: '1A-001',
      nombreProducto: 'PRODUCTO A',
      unidad: 'm',
      fecha: '10/06/2024',
      tipoMovimiento: 'Salida',
      observacion: 'Obs 1',
      modulo: 'Ventas',
    },
    {
      correlativo: '1B',
      codigoProducto: '1B-002',
      nombreProducto: 'PRODUCTO B',
      unidad: 'cm',
      fecha: '00/00/0000',
      tipoMovimiento: 'Salida',
      observacion: 'Obs 2',
      modulo: 'Ventas',
    },
    {
      correlativo: '1C',
      codigoProducto: '1C-003',
      nombreProducto: 'PRODUCTO C',
      unidad: 'L',
      fecha: '12/06/2024',
      tipoMovimiento: 'Entrada',
      observacion: 'Obs 3',
      modulo: 'Compras',
    },
  ];

  const parseDate = (str) => {
    const [day, month, year] = str.split('/');
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d) ? null : d;
  };

  let filteredMovements = [...mockMovements];

  filteredMovements = filteredMovements.filter((m) =>
    m.nombreProducto.toLowerCase().includes(nameFilter.toLowerCase())
  );

  if (nameOrder) {
    filteredMovements.sort((a, b) =>
      nameOrder === 'asc'
        ? a.nombreProducto.localeCompare(b.nombreProducto)
        : b.nombreProducto.localeCompare(a.nombreProducto)
    );
  }

  if (dateOrder) {
    filteredMovements.sort((a, b) => {
      const fa = parseDate(a.fecha);
      const fb = parseDate(b.fecha);

      if (!fa && !fb) return 0;
      if (!fa) return 1;
      if (!fb) return -1;

      return dateOrder === 'asc' ? fa - fb : fb - fa;
    });
  }

  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh' }}>
      <h2 className="text-center text-white fw-bold mb-4">Lista de Movimientos de Productos</h2>

      <div className="d-flex justify-content-end gap-2 mb-4">
        <button
          className="btn text-white d-flex align-items-center gap-2 px-3"
          style={{ backgroundColor: '#2E1A47', borderRadius: '50px' }}
          onClick={() => setShowExcelModal(true)}
        >
          Generar Reporte
          <BsFileEarmarkExcel size={20} />
        </button>
        <button
          className="btn text-white d-flex align-items-center gap-2 px-3"
          style={{ backgroundColor: '#2E1A47', borderRadius: '50px' }}
          onClick={() => setShowPdfModal(true)}
        >
          Generar Reporte
          <BsFileEarmarkPdf size={20} />
        </button>
      </div>

      <ProductMovementTable
        movements={filteredMovements}
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        nameOrder={nameOrder}
        setNameOrder={setNameOrder}
        dateOrder={dateOrder}
        setDateOrder={setDateOrder}
      />

      <ExcelReport
        show={showExcelModal}
        onGenerate={(fileName) => {
          generateProductMovementsExcel(fileName, filteredMovements);
          setShowExcelModal(false);
        }}
        onCancel={() => setShowExcelModal(false)}
      />

      <PdfReport
        show={showPdfModal}
        onGenerate={(fileName) => {
          generateProductMovementsPDF(fileName, filteredMovements);
          setShowPdfModal(false);
        }}
        onCancel={() => setShowPdfModal(false)}
      />
    </div>
  );
};

export default ProductMovementList;
