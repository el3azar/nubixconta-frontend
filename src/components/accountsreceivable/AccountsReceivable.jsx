import React, { useEffect, useState } from "react";
import RegisterReceivableLiquidacion from "./RegisterReceivableLiquidacion";
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import {fetchAccountsReceivable,fetchAccountsByDate,} from "../../services/accountsReceivableServices";
import DateRangeFilter from "../../components/accountsreceivable/DateRangeFilter";
import EditReceivableLiquidation from "./EditReceivableLiquidation";
import { getCollectionDetailById } from "../../services/accountsreceivable/getCollectionDetailById";
import { useCompany } from "../../context/CompanyContext";
import { useAuth } from "../../context/AuthContext";
import AccountingEntryModal from "../shared/AccountingEntryModal";
import { getCollectionEntryById } from "../../services/accountsreceivable/getCollectionEntryById";
import {
  FaPlus,
  FaCheck,
  FaEye,
  FaEdit,
  FaTrash,
  FaBan,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { deleteCollectionDetail } from "../../services/accountsreceivable/deleteByCollectionDetails";
import { showSuccess, showError } from "../../components/inventory/alerts";
import Swal from "sweetalert2";
import { applyCollectionEntry } from "../../services/accountsreceivable/collectionEntryApply";
import { cancelCollectionEntry } from "../../services/accountsreceivable/collectionEntryCancel";
const AccountsReceivable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [descripcionExpandida, setDescripcionExpandida] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

//Estados para el modal de ver el asiento contable
  const [showAccountingModal, setShowAccountingModal] = useState(false);
  const [accountingEntryData, setAccountingEntryData] = useState(null);
  const [isLoadingAccountingEntry, setIsLoadingAccountingEntry] = useState(false);
  const [accountingEntryError, setAccountingEntryError] = useState(null);
  const { company } = useCompany();
  const { user } = useAuth();

  useEffect(() => {
    fetchAccountsReceivable()
      .then(processAndSetData)
      .catch(console.error);
  }, []);

  const formatDateForBackend = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };
const handleEdit = async (id) => {
  try {
    const fila = data.find(f => f.id === id);
    const detalle = await getCollectionDetailById(id);

    // Inyectamos manualmente el número de documento desde la tabla
    detalle.documentNumber = fila.documento;

    setDetalleSeleccionado(detalle);
    setShowEditModal(true);
  } catch (error) {
    showError(error.message);
  }
};

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    try {
      const formattedStart = formatDateForBackend(startDate);
      const formattedEnd = formatDateForBackend(endDate);
      const data = await fetchAccountsByDate(formattedStart, formattedEnd);
      processAndSetData(data);
    } catch (error) {
      console.error("Error al filtrar por fechas:", error);
    }
  };
  
//Metodo para eliminar un collectionDetails por id
const handleDelete = async (id) => {
  const confirmacion = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará el registro de forma permanente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (confirmacion.isConfirmed) {
    try {
      await deleteCollectionDetail(id);
      showSuccess("Cobro eliminado correctamente");

      fetchAccountsReceivable()
        .then(processAndSetData)
        .catch(console.error);
    } catch (error) {
      showError("Ocurrió un error: " + error.message);
    }
  }
};
const handleApply = async (fila) => {
  const confirm = await Swal.fire({
    title: "¿Deseas aplicar esta partida contable?",
    text: "El asiento contable se creara",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, aplicar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    await applyCollectionEntry(fila.id);
    showSuccess("Partida contable aplicada correctamente");

    const response = await fetchAccountsReceivable();
    processAndSetData(response);
  } catch (error) {
    console.error("Detalles del error:", error);
    showError("Error al aplicar la partida contable");
  }
};

const handleCancel = async (id) => {
  const confirm = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción anulará la liquidación contable.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, anular",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    await cancelCollectionEntry(id);
    showSuccess("Partida anulada correctamente");

    const updated = await fetchAccountsReceivable();
    processAndSetData(updated);
  } catch (error) {
    showError("Error al anular la partida contable");
  }
};


  const processAndSetData = (response) => {
    if (!Array.isArray(response)) return;

    let contador = 1;
    const transformed = [];

    response.forEach((item) => {
      if (!Array.isArray(item.collectionDetails)) return;

      item.collectionDetails.forEach((detail) => {
        transformed.push({
          id: detail.id,
          correlativo: contador++,
          documento: item.sale?.documentNumber ?? "N/A",
          estado: detail.paymentStatus ?? "N/A",
          cliente: item.sale?.customerName ?? "Sin cliente",
          fecha: detail.collectionDetailDate?.substring(0, 10) ?? "",
          formaPago: detail.paymentMethod ?? "N/A",
          saldo: item.balance ? `$${item.balance.toFixed(2)}` : "$0.00",
          montoTotal: item.sale?.totalAmount
            ? `$${item.sale.totalAmount.toFixed(2)}`
            : "$0.00",
          descripcion: detail.paymentDetailDescription ?? "",
          diasCredito: item.sale?.creditDay ?? 0,
          color:
            detail.paymentStatus === "APLICADO"
              ? "green"
              : detail.paymentStatus === "ANULADO"
              ? "red"
              : "neutral",
        });
      });
    });

    setData(transformed);
  };

    //  MANEJADOR PARA EL MODAL DE ASIENTO CONTABLE ---
  const handleViewAccountingEntry = async (id) => {
    setIsLoadingAccountingEntry(true);
    setShowAccountingModal(true);
    setAccountingEntryError(null);
    try {
      const entry = await getCollectionEntryById(id);
      // Adaptar el formato de datos para que el componente AccountingEntry lo entienda
      const formattedEntry = {
        accountingEntryId: entry[0]?.id || "N/A",
        entryDate: entry[0]?.date.substring(0, 10) || "N/A",
        documentType: entry[0]?.tipo,
        documentNumber: entry[0]?.documentNumber,
        partnerLabel: 'Cliente',
        partnerName: entry[0]?.custumerName,
        description: entry[0]?.description,
        documentStatus: entry[0]?.status,
        lines: entry.map(line => ({
          accountCode: line.codAccount,
          accountName: line.accountName,
          debit: line.debit,
          credit: line.credit,
        })),
        totalDebits: entry.reduce((sum, line) => sum + line.debit, 0),
        totalCredits: entry.reduce((sum, line) => sum + line.credit, 0),
        companyName: company?.companyName || "No disponible",
        username: user?.sub || "No disponible",
      };
      setAccountingEntryData(formattedEntry);
    } catch (error) {
      setAccountingEntryError(error.message);
      setAccountingEntryData(null);
    } finally {
      setIsLoadingAccountingEntry(false);
    }
  };

  const toggleDescripcion = (index) => {
    setDescripcionExpandida((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.titulo}>LIQUIDACIONES</h2>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
      />

      <div className={styles.botonNuevaWrapper}>
        <button className={styles.btnNueva} onClick={() => setShowModal(true)}>
          <FaPlus style={{ marginRight: "0.5rem" }} />
          Nueva
        </button>
      </div>

      {showModal && (
  <RegisterReceivableLiquidacion
  onClose={() => {
    setShowModal(false);
    fetchAccountsReceivable()
      .then(processAndSetData)
      .catch(console.error);
  }}
/>
)}

{showEditModal && detalleSeleccionado && (
  <EditReceivableLiquidation
    collectionDetail={detalleSeleccionado}
    onClose={() => {
      setShowEditModal(false);
      setDetalleSeleccionado(null);
      fetchAccountsReceivable()
        .then(processAndSetData)
        .catch(console.error);
    }}
  />
)}

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Correlativo</th>
              <th>N° de documento</th>
              <th>Estado</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Forma de pago</th>
              <th>Saldo</th>
              <th>Monto total</th>
              <th>Descripción</th>
              <th>Días de crédito</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fila, index) => (
              <tr key={index} className={styles[`row-${fila.color}`]}>
                <td>{fila.correlativo}</td>
                <td>{fila.documento}</td>
                <td>
                  <span style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span>{fila.estado}</span>
                    {fila.estado === "PENDIENTE" && (
                      <>
                        <FaCheck title="Aplicar" className={styles.icono} onClick={() => handleApply(fila)}/>
                       <FaEdit title="Editar" className={styles.icono} onClick={() => handleEdit(fila.id)} />
                        <FaTrash title="Eliminar" className={styles.icono} onClick={()=> handleDelete(fila.id)} />
                      </>
                    )}
                    {fila.estado === "APLICADO" && (
                      <>
                        <FaEye title="Ver" className={styles.icono} onClick={() => handleViewAccountingEntry(fila.id)} />
                          <FaBan title="Anular" className={styles.icono} onClick={() => handleCancel(fila.id)} />
                      </>
                    )}
                  </span>
                </td>
                <td>{fila.cliente}</td>
                <td>{fila.fecha}</td>
                <td>{fila.formaPago}</td>
                <td>{fila.saldo}</td>
                <td>{fila.montoTotal}</td>
                <td className={styles.descripcionCell}>
                  <div className={styles.descripcionWrapper}>
                    <span className={descripcionExpandida[index] ? styles.expandida : ""}>
                      {descripcionExpandida[index]
                        ? fila.descripcion
                        : fila.descripcion.length > 40
                        ? fila.descripcion.slice(0, 40) + "..."
                        : fila.descripcion}
                    </span>
                    {fila.descripcion.length > 40 && (
                      <button
                        className={styles.toggleBtn}
                        onClick={() => toggleDescripcion(index)}
                        title={
                          descripcionExpandida[index]
                            ? "Colapsar descripción"
                            : "Ver descripción completa"
                        }
                      >
                        {descripcionExpandida[index] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                  </div>
                </td>
                <td>{fila.diasCredito}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* --- RENDERIZADO DEL MODAL DE ASISTENCIA CONTABLE REUTILIZADO --- */}
       <AccountingEntryModal
        show={showAccountingModal}
        onHide={() => setShowAccountingModal(false)}
        data={accountingEntryData}
        isLoading={isLoadingAccountingEntry}
        isError={!!accountingEntryError}
        error={{ message: accountingEntryError }}
      />
    </section>
  );
};

export default AccountsReceivable;
