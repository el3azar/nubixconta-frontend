import React, { useState } from "react";
import styles from "../../styles/accountsreceivable/AccountReceivableAccount.module.css";
import { FaSearch, FaFilePdf, FaFileExcel, FaEye } from "react-icons/fa";
import { getAccountStatementsByCustomer } from "../../services/accountsreceivable/accountReceivableCustumerService";
import { getBankAcount } from "../../services/accountsreceivable/bankService";
import BankAccountModal from "./BankAccountModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const AccountStatement = () => {
  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    dui: "",
    nit: "",
  });

  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = async () => {
    const results = await getAccountStatementsByCustomer(filters);

    const mappedData = results.map((item, index) => ({
      correlativo: index + 1,
      documento: item.documentNumber,
      fecha: item.issueDate,
      mora: item.daysLate,
      saldo: item.balance,
    }));

    setData(mappedData);
  };

  const handleShowAccounts = async () => {
    const cuentas = await getBankAcount();
    setAccounts(cuentas);
    setShowModal(true);
  };
//Metodo para generar el pdf
  const generateAccountPDF = ({ cliente, usuario, tabla, cuentas }) => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString();

    doc.setFontSize(14);
    doc.text(`REPORTE DE ESTADOS DE CUENTA DEL CLIENTE ${cliente}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${fechaActual}`, 14, 28);
    doc.text(`Generado por: ${usuario}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [["Correlativo", "Documento", "Fecha", "Mora", "Saldo"]],
      body: tabla.map(row => [
        row.correlativo,
        row.documento,
        row.fecha,
        row.mora,
        `$${row.saldo.toFixed(2)}`
      ]),
      theme: "striped"
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Código", "Nombre"]],
      body: cuentas.map(c => [c.generatedCode, c.accountName]),
      theme: "grid"
    });

    doc.save(`estado_cuenta_${cliente}.pdf`);
  };
  //Exportar en excel
const exportToExcel = ({ cliente, usuario, tabla, cuentas }) => {
  const fechaActual = new Date().toLocaleDateString();

  //  Estado de cuenta
  const estadoCuentaData = [
    ["REPORTE DE ESTADOS DE CUENTA DEL CLIENTE", cliente],
    ["Fecha del reporte", fechaActual],
    ["Generado por", usuario],
    [],
    ["Correlativo", "Documento", "Fecha de emisión", "Días de mora", "Saldo"],
    ...tabla.map((item) => [
      item.correlativo,
      item.documento,
      item.fecha,
      item.mora,
      item.saldo,
    ]),
  ];

  const cuentasBancariasData = [
    ["CUENTAS BANCARIAS DEL SISTEMA"],
    ["Fecha del reporte", fechaActual],
    [],
    ["Código", "Nombre"],
    ...cuentas.map((c) => [c.generatedCode, c.accountName]),
  ];

  // Crear hojas
  const wb = XLSX.utils.book_new();

  const wsEstado = XLSX.utils.aoa_to_sheet(estadoCuentaData);
  XLSX.utils.book_append_sheet(wb, wsEstado, "Estado de Cuenta");

  const wsCuentas = XLSX.utils.aoa_to_sheet(cuentasBancariasData);
  XLSX.utils.book_append_sheet(wb, wsCuentas, "Cuentas Bancarias");

  // Guardar archivo
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `estado_cuenta_${cliente}.xlsx`);
};

  return (
    <section className={styles.container}>
      <h2 className={styles.titulo}>ESTADO DE CUENTA POR CLIENTE</h2>

      <div className={styles.seccionSuperior}>
        <div className={styles.bloqueFiltros}>
          <h4 className={styles.subtitulo}>Buscar Cliente</h4>
          <div className={styles.gridFiltros}>
            <div className={styles.filtro}>
              <label>Nombre:</label>
              <input name="nombre" value={filters.nombre} onChange={handleChange} />
            </div>
            <div className={styles.filtro}>
              <label>Apellido:</label>
              <input name="apellido" value={filters.apellido} onChange={handleChange} />
            </div>
            <div className={styles.filtro}>
              <label>DUI:</label>
              <input name="dui" placeholder="########-#" value={filters.dui} onChange={handleChange} />
            </div>
            <div className={styles.filtro}>
              <label>NIT:</label>
              <input name="nit" value={filters.nit} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.centrado}>
            <button className={styles.btnBuscar} onClick={handleSearch}>
              <FaSearch style={{ marginRight: "0.5rem" }} />
              Buscar
            </button>
          </div>
        </div>

        <div className={styles.bloqueLateral}>
          <button className={styles.btnVerCuentas} onClick={handleShowAccounts}>
            <FaEye style={{ marginRight: "0.5rem" }} />
            Ver cuentas
          </button>
          <div className={styles.exportaciones}>
            <button
              className={styles.exportBtn}
              onClick={() =>
                generateAccountPDF({
                  cliente: filters.nombre || "Desconocido",
                  usuario: sessionStorage.getItem("nubix_user") || "Sistema",
                  tabla: data,
                  cuentas: accounts
                })
              }
            >
              <FaFilePdf />
              Exportar en PDF
            </button>
        <button
  className={styles.exportBtn}
  onClick={() =>
    exportToExcel({
      cliente: filters.nombre || "Desconocido",
      usuario: sessionStorage.getItem("nubix_user") || "Sistema",
      tabla: data,
      cuentas: accounts,
    })
  }
>
  <FaFileExcel />
  Exportar en Excel
</button>

          </div>
        </div>
      </div>

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Correlativo</th>
              <th>N° de documento</th>
              <th>Fecha de emisión</th>
              <th>Días de mora</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fila) => (
              <tr key={fila.correlativo}>
                <td>{fila.correlativo}</td>
                <td>{fila.documento}</td>
                <td>{fila.fecha}</td>
                <td>{fila.mora}</td>
                <td>${fila.saldo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BankAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        accounts={accounts}
      />
    </section>
  );
};

export default AccountStatement;


