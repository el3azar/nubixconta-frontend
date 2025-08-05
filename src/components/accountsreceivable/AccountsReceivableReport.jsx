import React, { useState, useEffect } from "react";
import DateRangeFilter from '../../components/accountsreceivable/DateRangeFilter';
import styles from "../../styles/accountsreceivable/AccountsReceivableReport.module.css";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { getAccountsReceivable } from "../../services/accountsreceivable/accountsReceivableReportService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AccountsReceivableReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

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
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("es-ES");
  };

  const getDueDate = (saleDate, creditDay) => {
    const date = new Date(saleDate);
    date.setDate(date.getDate() + creditDay);
    return formatDate(date);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const usuario = sessionStorage.getItem("nubix_user") || "Sistema";
    const fecha = new Date().toLocaleDateString("es-ES");

    doc.setFontSize(14);
    doc.text("REPORTE DE CUENTAS POR COBRAR", 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${fecha}`, 14, 28);
    doc.text(`Generado por: ${usuario}`, 14, 34);

    const tableData = reportData.map((item) => [
      item.sale.documentNumber,
      item.sale.customer.customerName,
      formatDate(item.sale.saleDate),
      getDueDate(item.sale.saleDate, item.creditDay),
      `$${item.sale.totalAmount.toFixed(2)}`,
      `$${item.balance.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["N° de documento", "Cliente", "Fecha de emisión", "Fecha de vencimiento", "Monto total", "Saldo"]],
      body: tableData,
      theme: "striped",
    });

    doc.save("reporte_cuentas_por_cobrar.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = reportData.map((item) => ({
      "N° de documento": item.sale.documentNumber,
      Cliente: item.sale.customer.customerName,
      "Fecha de emisión": formatDate(item.sale.saleDate),
      "Fecha de vencimiento": getDueDate(item.sale.saleDate, item.creditDay),
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
      <h2>REPORTE DE CUENTAS POR COBRAR</h2>

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
          <thead>
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
                <td>{formatDate(item.sale.saleDate)}</td>
                <td>{getDueDate(item.sale.saleDate, item.creditDay)}</td>
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
