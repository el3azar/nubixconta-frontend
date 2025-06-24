import React, { useEffect, useState } from "react";
import RegisterReceivableLiquidacion from "./RegisterReceivableLiquidacion";
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import {
  fetchAccountsReceivable,
  fetchAccountsByDate,
} from "../../services/accountsReceivableServices";
import DateRangeFilter from "../../components/accountsreceivable/DateRangeFilter";
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

const AccountsReceivable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [descripcionExpandida, setDescripcionExpandida] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAccountsReceivable()
      .then(processAndSetData)
      .catch(console.error);
  }, []);

  const formatDateForBackend = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
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

  const processAndSetData = (response) => {
    if (!Array.isArray(response)) return;

    let contador = 1;
    const transformed = [];

    response.forEach((item) => {
      if (!Array.isArray(item.collectionDetails)) return;

      item.collectionDetails.forEach((detail) => {
        transformed.push({
          correlativo: contador++,
          documento: item.sale?.documentNumber ?? "N/A",
          estado: detail.paymentStatus ?? "N/A",
          cliente: item.sale?.customer?.customerName ?? "Sin cliente",
          fecha: item.receivableAccountDate?.substring(0, 10) ?? "",
          formaPago: detail.paymentMethod ?? "N/A",
          saldo: item.balance ? `$${item.balance.toFixed(2)}` : "$0.00",
          montoTotal: item.sale?.totalAmount
            ? `$${item.sale.totalAmount.toFixed(2)}`
            : "$0.00",
          descripcion: detail.paymentDetailDescription ?? "",
          diasCredito: item.creditDay ?? 0,
          color:
            detail.paymentStatus === "APLICADO"
              ? "green"
              : detail.paymentStatus === "ANULADA"
              ? "red"
              : "neutral",
        });
      });
    });

    setData(transformed);
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
        <RegisterReceivableLiquidacion onClose={() => setShowModal(false)} />
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
                        <FaCheck title="Aplicar" className={styles.icono} />
                        <FaEdit title="Editar" className={styles.icono} />
                        <FaTrash title="Eliminar" className={styles.icono} />
                      </>
                    )}
                    {fila.estado === "APLICADO" && (
                      <>
                        <FaEye title="Ver" className={styles.icono} />
                        <FaBan title="Anular" className={styles.icono} />
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
    </section>
  );
};

export default AccountsReceivable;
