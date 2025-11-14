import React, { useState } from "react";
import SubMenu from '../../shared/SubMenu';
import ViewContainer from '../../shared/ViewContainer';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';

import AccFilterCardBase from '../accounting-reports/acc-elements/accFilterCardBase.jsx'; 
import ReportHeader from '../accounting-reports/acc-elements/reportHeader.jsx';
import ReportBody from '../accounting-reports/acc-elements/reportBody.jsx';
import ReportSigns from '../accounting-reports/acc-elements/reportSigns.jsx';
import Boton from '../../../components/inventory/inventoryelements/Boton.jsx';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import { Notifier } from '../../../utils/alertUtils';

const LibroDiario = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [datosReporte, setDatosReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSearch = async () => {
    setCargando(true);
    
    // (Simulación de datos ACTUALIZADA para la tabla)
    setTimeout(() => {
      const dataSimulada = {
        encabezado: {
          empresa: "Tu Empresa, S.A. de C.V.",
          reporte: "Libro Diario",
          periodo: `Del ${startDate || 'YYYY-MM-DD'} al ${endDate || 'YYYY-MM-DD'} en dolares de Estados Unidos`
        },
        partidas: [
          {
            id: 'P-001', fecha: '2025-01-05', descripcion: 'Venta de servicios',
            detalles: [
              { codigo: '1101', cuenta: 'Caja General', debe: 1130, haber: 0 },
              { codigo: '4101', cuenta: 'Ingresos por Servicios', debe: 0, haber: 1000 },
              { codigo: '2105', cuenta: 'IVA Débito Fiscal', debe: 0, haber: 130 }
            ],
            total_debe: 1130, total_haber: 1130
          },
          {
            id: 'P-002', fecha: '2025-01-06', descripcion: 'Compra de papelería',
            detalles: [
              { codigo: '5101', cuenta: 'Gastos de Administración', debe: 100, haber: 0 },
              { codigo: '1106', cuenta: 'IVA Crédito Fiscal', debe: 13, haber: 0 },
              { codigo: '1101', cuenta: 'Caja General', debe: 0, haber: 113 }
            ],
            total_debe: 113, total_haber: 113
          }
        ],
        totalesPeriodo: {
          total_debe: 1243,
          total_haber: 1243
        }
      };
      
      setDatosReporte(dataSimulada);
      setCargando(false);
    }, 2000);
  };
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

  return (
    <div>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer>
        <h1 className="text-center">Libro Diario</h1>
        
        <AccFilterCardBase 
          titulo="Personalización de Reporte"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearch={handleSearch}
          
          // Omitimos 'onNivelDetalleChange' y el Libro Diario
          // no mostrará los radios. ¡Perfecto!
        />

        <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
          {/* Lado Izquierdo: Nuevos botones de filtro por origen */}
          <div className="d-flex gap-2 flex-wrap mb-2 mb-md-0">
              <p>RESULTADOS</p>
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

        {cargando && <div>Cargando...</div>}
        {/* --- ¡AQUÍ ESTÁ LA IMPLEMENTACIÓN COMPLETA! --- */}
        {!cargando && datosReporte && (
          <div className="reporte-wrapper" style={{marginTop: '2rem'}}>
            
            <ReportHeader 
              empresa={datosReporte.encabezado.empresa}
              reporte={datosReporte.encabezado.reporte}
              periodo={datosReporte.encabezado.periodo}
            />

            <ReportBody 
              partidas={datosReporte.partidas} 
              totalesPeriodo={datosReporte.totalesPeriodo}
            />

            <ReportSigns />
          </div>
        )}
      </ViewContainer>
    </div>
  );
};

export default LibroDiario;