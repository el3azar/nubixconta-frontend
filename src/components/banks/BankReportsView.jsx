// imports generales
import React, { useState, useEffect, useCallback } from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { Notifier } from '../../utils/alertUtils';
import { formatDate } from '../../utils/dateFormatter';
// imports especificos de la vista
import SearchCardBank from './SearchCardBank';
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from 'react-icons/bs';
import Boton from '../inventory/inventoryelements/Boton';
import { DocumentTable } from '../shared/DocumentTable';

// --- IMPORTACIONES REALES PARA REPORTES ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// --- IMPORTAR SERVICIOS NECESARIOS ---//
import { useBankModuleService } from '../../services/banks/BankModuleService'; // <-- Usamos el nuevo servicio para 'Este Modulo'
import { useBankEntriesService } from '../../services/banks/BankEntriesService'; // <-- Este se mantiene para 'Otros Modulos'
import { useCompany } from "../../context/CompanyContext";
import { useAuth } from "../../context/AuthContext";
import { DocumentTableBank } from '../shared/TableBank';

// --- FUNCIÓN COMPLETA PARA CARGAR IMAGEN ---
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

// --- DEFINICIÓN DE COLUMNAS PARA 'ESTE MODULO'  ---
export const thisModuleReportColumns = [
    {
        header: 'Correlativo',
        accessor: 'idBankEntry',
        cell: (doc, index) => index + 1,
        style: { width: '80px', textAlign: 'center' }
    },
    {
        header: 'No. de referencia',
        accessor: 'idBankEntry',
        style: { width: '130px', textAlign: 'center' }
    },
    {
        header: 'Monto',
        accessor: 'debit',
        cell: (doc) => {
            const amount = doc.debit > 0 ? doc.debit : doc.credit;
            return `$${amount ? amount.toFixed(2) : '0.00'}`;
        },
        style: { width: '120px', textAlign: 'right', fontWeight: 'bold' }
    },
    {
        header: 'Descripción',
        accessor: 'description',
        style: { flexGrow: 1 }
    },
    {
        header: 'Fecha',
        accessor: 'date',
        cell: (doc) => formatDate(doc.date),
        style: { width: '130px' }
    },
];

// --- DEFINICIÓN DE COLUMNAS PARA 'OTROS MODULOS' ---
export const otherModulesReportColumns = [
    { header: 'Correlativo', accessor: 'idBankEntry', cell: (doc, index) => index + 1, style: { width: '80px', textAlign: 'center' } },
    { header: 'No. de asiento', accessor: 'id', style: { width: '100px', textAlign: 'center' } },
    { header: 'Fecha de transacción', accessor: 'date', cell: (doc) => formatDate(doc.date), style: { width: '130px' } },
    { header: 'Cuenta contable', accessor: 'accountName', style: { width: '150px' } },
    { header: 'Descripción de la transaccion', accessor: 'description', style: { flexGrow: 1 } },
    { header: 'Cargo', accessor: 'debit', cell: (doc) => `$${doc.debit ? doc.debit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } },
    { header: 'Abono', accessor: 'credit', cell: (doc) => `$${doc.credit ? doc.credit.toFixed(2) : '0.00'}`, style: { width: '100px', textAlign: 'right', fontWeight: 'bold' } },
];


const BankReportsView = () => {
    const [accountName, setAccountName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeReportMode, setActiveReportMode] = useState('ESTE_MODULO');
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logoBase64, setLogoBase64] = useState(null);

    const { user } = useAuth();
    const { company } = useCompany();

    // --- INSTANCIAR LOS SERVICIOS ---
    const { filterBankModuleEntries } = useBankModuleService(); // Para 'Este Modulo'
    const { listAllBankEntries } = useBankEntriesService();    // Para 'Otros Modulos'

    const isEsteModulo = activeReportMode === 'ESTE_MODULO';
    const currentColumns = isEsteModulo ? thisModuleReportColumns : otherModulesReportColumns;

    // --- LÓGICA DE BÚSQUEDA COMPLETA Y  ---
    const handleSearch = useCallback(async () => {
        if (!accountName && !startDate && !endDate) {
            Notifier.info("Por favor, ingrese al menos un criterio de búsqueda.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReportData([]);

        try {
            const filters = {
                accountName: accountName,
                dateFrom: startDate,
                dateTo: endDate,
            };

            let data;
            if (isEsteModulo) {
                // Llamamos al nuevo servicio con el objeto de filtros
                data = await filterBankModuleEntries(filters);
            } else {
                // La lógica para 'Otros Módulos' 
                data = await listAllBankEntries(filters);
            }
            setReportData(data);

        } catch (err) {
            console.error("Error en la búsqueda del reporte:", err);
            setError(err);
            Notifier.error("Error al cargar datos del reporte.");
        } finally {
            setIsLoading(false);
        }
    }, [accountName, startDate, endDate, isEsteModulo, filterBankModuleEntries, listAllBankEntries]);

    const handleClear = () => {
        setAccountName('');
        setStartDate('');
        setEndDate('');
        setReportData([]);
        setError(null);
    };

    const handleModuleChange = (moduleKey) => {
        setActiveReportMode(moduleKey);
        handleClear();
    };

    useEffect(() => {
        if (company?.imageUrl) {
            loadImageAsBase64(company.imageUrl).then(setLogoBase64).catch(error => {
                console.error("Error al cargar el logo como Base64:", error);
                setLogoBase64(null);
            });
        } else {
            setLogoBase64(null);
        }
    }, [company?.imageUrl]);
    
    // --- FUNCIÓN COMPLETA PARA GENERAR PDF ---
    const generatePdfReport = () => {
        if (reportData.length === 0) {
            Notifier.info("No hay datos para generar el reporte PDF.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 14;
        const usuario = user?.sub || "Sistema";
        const fecha = new Date().toLocaleDateString("es-ES");
        const companyName = company?.companyName || "Nubix Company";

        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', margin, 10, 30, 15);
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 26, 71);
        doc.text(companyName, margin, 32);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text("Reporte de Transacciones de Bancos", pageWidth - margin, 18, { align: 'right' });
        doc.text(`Generado por: ${usuario}`, pageWidth - margin, 24, { align: 'right' });
        doc.text(`Fecha de generación: ${fecha}`, pageWidth - margin, 30, { align: 'right' });
        doc.setDrawColor(189, 195, 199);
        doc.line(margin, 40, pageWidth - margin, 40);

        const tableHeaders = currentColumns.map(col => col.header);
        const tableData = reportData.map((item, index) =>
            currentColumns.map(col => {
                if (col.cell) {
                    return col.cell(item, index);
                }
                return col.accessor.split('.').reduce((o, i) => (o ? o[i] : ''), item) ?? '';
            })
        );

        autoTable(doc, {
            startY: 50,
            head: [tableHeaders],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [44, 26, 71], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8 },
        });

        doc.save("reporte_bancos.pdf");
        Notifier.success("Reporte PDF generado con éxito.");
    };

    // --- FUNCIÓN COMPLETA PARA GENERAR EXCEL ---
    const generateExcelReport = () => {
        if (reportData.length === 0) {
            Notifier.info("No hay datos para generar el reporte Excel.");
            return;
        }

        const worksheetData = reportData.map((item, index) => {
            const row = {};
            currentColumns.forEach(col => {
                let cellContent = col.cell ? col.cell(item, index) : (col.accessor.split('.').reduce((o, i) => (o ? o[i] : null), item) ?? '');
                if (typeof cellContent === 'string' && cellContent.startsWith('$')) {
                    cellContent = parseFloat(cellContent.replace(/[$,]/g, ''));
                }
                row[col.header] = cellContent;
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones Bancarias");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        saveAs(blob, "reporte_bancos.xlsx");
        Notifier.success("Reporte Excel generado con éxito.");
    };

    // --- RENDERIZADO COMPLETO DEL COMPONENTE ---
    return (
        <>
            <div>
                <SubMenu links={banksSubMenuLinks} />
            </div>
            <div className={styles.title}>
                <h2>Generación de Reportes Bancarios</h2>
            </div>
            <SearchCardBank
                accountName={accountName}
                onAccountNameChange={setAccountName}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                handleSearch={handleSearch}
                handleClear={handleClear}
            />
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3'>
                <div className="d-flex gap-2 flex-wrap mb-2 mb-md-0">
                    <Boton color={isEsteModulo ? 'morado' : 'blanco'} forma="pastilla" onClick={() => handleModuleChange('ESTE_MODULO')}>
                        Este Modulo
                    </Boton>
                    <Boton color={!isEsteModulo ? 'morado' : 'blanco'} forma="pastilla" onClick={() => handleModuleChange('OTROS_MODULOS')}>
                        Otros Modulos
                    </Boton>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <Boton color="morado" forma="pastilla" onClick={generatePdfReport}>
                        Generar Reporte en PDF <BsFileEarmarkPdf size={19} className='ms-2'/>
                    </Boton>
                    <Boton color="morado" forma="pastilla" onClick={generateExcelReport}>
                        Generar Reporte en Excel <BsFileEarmarkExcel size={19} className='ms-2'/>
                    </Boton>
                </div>
            </div>
            <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                    <thead>
                        <tr className={styles.table_header}>
                            {currentColumns.map(col => (
                                <th key={col.header} style={col.style}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <DocumentTableBank
                            documents={reportData}
                            columns={currentColumns}
                            isLoading={isLoading}
                            isError={!!error}
                            error={error ? error.message : null}
                            showRowActions={false}
                            emptyMessage={
                                isEsteModulo
                                ? "Ingrese filtros para buscar transacciones del módulo de bancos."
                                : "Ingrese filtros para buscar entradas de otros módulos."
                            }
                            styles={styles}
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BankReportsView;