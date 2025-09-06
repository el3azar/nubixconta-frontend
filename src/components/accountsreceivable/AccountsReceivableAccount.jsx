import React, { useState, useEffect } from "react";
import styles from "../../styles/accountsreceivable/AccountReceivableAccount.module.css";
import { FaSearch, FaFilePdf, FaFileExcel, FaEye } from "react-icons/fa";
import { getAccountStatementsByCustomer } from "../../services/accountsreceivable/accountReceivableCustumerService";
import { getBankAcount } from "../../services/accountsreceivable/bankService";
import BankAccountModal from "./BankAccountModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useCompany } from "../../context/CompanyContext";
import { useAuth } from "../../context/AuthContext";

// Función para cargar una imagen como Base64 (reutilizada del otro reporte)
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
  const [logoBase64, setLogoBase64] = useState(null);

  const { user } = useAuth();
  const { company } = useCompany();

  useEffect(() => {
    if (company?.imageUrl) {
      loadImageAsBase64(company.imageUrl)
        .then(base64 => {
          setLogoBase64(base64);
        })
        .catch(error => {
          console.error("Error al cargar el logo como Base64:", error);
          setLogoBase64(null);
        });
    } else {
      setLogoBase64(null);
    }
  }, [company?.imageUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = async () => {
    const results = await getAccountStatementsByCustomer(filters);
    const mappedData = results.map((item, index) => ({
      correlativo: index + 1,
      documento: item.documentNumber,
      fecha: new Date(item.issueDate).toLocaleDateString("es-ES"),
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

  // Método para generar el pdf
  const generateAccountPDF = async () => { // <-- Ahora la función es async
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const fechaActual = new Date().toLocaleDateString("es-ES");
    const usuario = user?.sub || "Sistema";
    const companyName = company?.companyName || "Nombre de la Empresa";
    
    // Contenido del lado izquierdo
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, 10, 30, 15);
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 26, 71);
    doc.text(companyName, margin, 32);
    
    // Contenido del lado derecho
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Reporte de Estados de Cuenta", pageWidth - margin, 18, { align: 'right' });
    doc.text(`Generado por: ${usuario}`, pageWidth - margin, 24, { align: 'right' });
    doc.text(`Fecha de generación: ${fechaActual}`, pageWidth - margin, 30, { align: 'right' });

    // Línea divisoria
    doc.setDrawColor(189, 195, 199);
    doc.line(margin, 40, pageWidth - margin, 40);

    // Obtener las cuentas bancarias justo antes de generar el PDF
    const cuentas = await getBankAcount();

    autoTable(doc, {
      startY: 45,
      head: [["Correlativo", "Documento", "Fecha", "Mora", "Saldo"]],
      body: data.map(row => [
        row.correlativo,
        row.documento,
        row.fecha,
        row.mora,
        `$${row.saldo.toFixed(2)}`
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [44, 26, 71],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Código", "Nombre"]],
      body: cuentas.map(c => [c.generatedCode, c.accountName]),
      theme: "grid",
      headStyles: { // Aplicar el mismo estilo de encabezado a la tabla de cuentas
        fillColor: [44, 26, 71],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    const getClienteName = () => {
      if (filters.nombre && filters.apellido) return `${filters.nombre} ${filters.apellido}`;
      if (filters.nombre) return filters.nombre;
      if (filters.dui) return `DUI: ${filters.dui}`;
      if (filters.nit) return `NIT: ${filters.nit}`;
      return "Desconocido";
    };

    doc.save(`estado_cuenta_${getClienteName()}.pdf`);
  };

  // Exportar en excel
  const exportToExcel = ({ cliente, tabla, cuentas }) => {
    const fechaActual = new Date().toLocaleDateString("es-ES");
    const usuario = user?.sub || "Sistema";
    const companyName = company?.companyName || "Nombre de la Empresa";

    const headerData = [
      [companyName],
      ["REPORTE DE ESTADOS DE CUENTA"],
      [`Generado por: ${usuario} | Fecha: ${fechaActual}`],
      [],
    ];

    const estadoCuentaData = [
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
      [],
      ["CUENTAS BANCARIAS DEL SISTEMA"],
      [`Fecha del reporte: ${fechaActual}`],
      [],
      ["Código", "Nombre"],
      ...cuentas.map((c) => [c.generatedCode, c.accountName]),
    ];

    const wb = XLSX.utils.book_new();
    const wsEstado = XLSX.utils.aoa_to_sheet([...headerData, ...estadoCuentaData]);
    wsEstado['A1'].s = { font: { sz: 16, bold: true }, alignment: { horizontal: 'center' } };
    wsEstado['A2'].s = { font: { sz: 14 }, alignment: { horizontal: 'center' } };
    wsEstado['A3'].s = { font: { sz: 10 }, alignment: { horizontal: 'center' } };
    wsEstado['A1'].t = 's';

    XLSX.utils.book_append_sheet(wb, wsEstado, "Estado de Cuenta");
    const wsCuentas = XLSX.utils.aoa_to_sheet(cuentasBancariasData);
    XLSX.utils.book_append_sheet(wb, wsCuentas, "Cuentas Bancarias");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `estado_cuenta_${cliente}.xlsx`);
  };

  const getClienteName = () => {
    if (filters.nombre && filters.apellido) {
      return `${filters.nombre} ${filters.apellido}`;
    }
    if (filters.nombre) return filters.nombre;
    if (filters.dui) return `DUI: ${filters.dui}`;
    if (filters.nit) return `NIT: ${filters.nit}`;
    return "Desconocido";
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
            <p>Guardar como:</p>
            <button
              className={styles.exportBtn}
              onClick={generateAccountPDF} // <-- Llamada a la función sin parámetros
            >
              <FaFilePdf />
              PDF
            </button>
            <button
              className={styles.exportBtn}
              onClick={() =>
                exportToExcel({
                  cliente: getClienteName(),
                  tabla: data,
                  cuentas: accounts,
                })
              }
            >
              <FaFileExcel />
              Excel
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