import React, { useState, useEffect } from "react";
import DateRangeFilter from '../../components/accountsreceivable/DateRangeFilter';
import styles from "../../styles/accountsreceivable/AccountsReceivableReport.module.css";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { getAccountsReceivable } from "../../services/accountsreceivable/accountsReceivableReportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useCompany } from "../../context/CompanyContext";
import { useAuth } from "../../context/AuthContext";

// Función para cargar una imagen como Base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Importante para evitar problemas de CORS
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


const AccountsReceivableReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [logoBase64, setLogoBase64] = useState(null);
 
  //  los hooks para obtener la información del contexto
  const { user } = useAuth();
  const { company } = useCompany();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountsReceivable();
        setReportData(data);
      } catch (error) {
        console.error("Error cargando reporte de cuentas por cobrar:", error);
      }
    };
    fetchData();
     // Cargar el logo como base64 cuando company.imageUrl cambie
    if (company?.imageUrl) {
      loadImageAsBase64(company.imageUrl)
        .then(base64 => {
          setLogoBase64(base64);
        })
        .catch(error => {
          console.error("Error al cargar el logo como Base64:", error);
          setLogoBase64(null); // Asegurarse de que el logo no se use si hay un error
        });
    } else {
      setLogoBase64(null); // Limpiar el logo si no hay URL
    }
  }, [company?.imageUrl]); // Dependencia en company.imageUrl para recargar si cambia


  

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("es-ES");
  };

  const getDueDate = (saleDate, creditDay) => {
     if (!saleDate || !creditDay) return "";
    const date = new Date(saleDate);
    date.setDate(date.getDate() + creditDay);
    return formatDate(date.toISOString());
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin =14;
    const usuario = user?.sub || "Sistema";
    const fecha = new Date().toLocaleDateString("es-ES");
    const companyName = company?.companyName || "";
    const companyLogo = company?.imageUrl || "";

    // Contenido del lado izquierdo: Logo y nombre de la empresa
    if (companyLogo) {
       doc.addImage(logoBase64, 'PNG', margin, 10, 30, 15);
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 26, 71); 
    doc.text(companyName,margin, 32);
    
    //Contenido del lado derecho: Tipo de reporte, generado por y fecha
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Reporte de Cuentas por Cobrar", pageWidth - margin, 18, { align: 'right' });
    doc.text(`Generado por: ${usuario}`, pageWidth - margin, 24, { align: 'right' });
    doc.text(`Fecha de generación: ${fecha}`, pageWidth - margin, 30, { align: 'right' });

     // 3. Línea divisoria
    doc.setDrawColor(189, 195, 199);
    doc.line(margin, 40, pageWidth - margin, 40);

    const tableData = reportData.map((item) => [
      item.sale.documentNumber,
      item.sale.customerName,
      formatDate(item.sale.issueDate),
      getDueDate(item.sale.issueDate, item.sale.creditDay),
      `$${item.sale.totalAmount.toFixed(2)}`,
      `$${item.balance.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["N° de documento", "Cliente", "Fecha de emisión", "Fecha de vencimiento", "Monto total", "Saldo"]],
      body: tableData,
      theme: "striped",
       headStyles: {
        fillColor: [44, 26, 71], // Color #2C1A47 en RGB
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        2: { cellWidth: 30 }, // Ancho de columna para "Fecha de emisión"
        3: { cellWidth: 30 }, // Ancho de columna para "Fecha de vencimiento"
        4: { cellWidth: 25 }, // Ancho de columna para "Monto total"
        5: { cellWidth: 25 }  // Ancho de columna para "Saldo"
      }
    });


    doc.save("reporte_cuentas_por_cobrar.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = reportData.map((item) => ({
      "N° de documento": item.sale.documentNumber,
      Cliente: item.sale.customerName,
      "Fecha de emisión": formatDate(item.sale.issueDate),
      "Fecha de vencimiento": getDueDate(item.sale.issueDate, item.sale.creditDay),
      "Monto total": item.sale.totalAmount,
      Saldo: item.balance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuentas por Cobrar");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "reporte_cuentas_por_cobrar.xlsx");
  };

  return (
    <div className={styles.container}>
     <div className={styles.reportHeader}>
        <h2>REPORTE DE CUENTAS POR COBRAR</h2>
      </div>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={() => console.log("Buscar entre:", startDate, endDate)}
      />

      <section className={styles.exportButtons}>
        <button className={styles.exportLink} onClick={exportToPDF}>
          <FaFilePdf size={20} />
          <span>Exportar en PDF</span>
        </button>
        <button className={styles.exportLink} onClick={exportToExcel}>
          <FaFileExcel size={20} />
          <span>Exportar como Excel</span>
        </button>
      </section>

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead className={styles.table_header}>
            <tr>
              <th>N° de documento</th>
              <th>Cliente</th>
              <th>Fecha de emisión</th>
              <th>Fecha de vencimiento</th>
              <th>Monto total</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item) => (
              <tr key={item.id}>
                <td>{item.sale.documentNumber}</td>
                <td>{item.sale.customerName}</td>
                <td>{formatDate(item.sale.issueDate)}</td>
                <td>{getDueDate(item.sale.issueDate, item.sale.creditDay)}</td>
                <td>${item.sale.totalAmount.toFixed(2)}</td>
                <td>${item.balance.toFixed(2)}</td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr>
                <td colSpan="6">No hay datos para mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsReceivableReport;
