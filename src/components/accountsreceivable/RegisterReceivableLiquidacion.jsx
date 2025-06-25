import React, { useState, useEffect } from "react";
import AutocompleteSelect from "./AutocompleteSelect";
import styles from "../../styles/accountsreceivable/RegisterReceivableLiquidacion.module.css";
import { getAllSales } from "../../services/salesServices";
import { getBankAcount } from "../../services/bankService";
import { registrarLiquidacionVenta } from "../../services/liquidacionVentaServices";
import { showSuccess, showError } from "../../components/inventory/alerts";

const RegisterReceivableLiquidacion = ({ onClose }) => {
  const [tipoLiquidacion, setTipoLiquidacion] = useState("VENTA");
  const [documentos, setDocumentos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Transacción");

  useEffect(() => {
    const fetchData = async () => {
      const ventas = await getAllSales();
      setDocumentos(ventas);
      const cuentas = await getBankAcount();
      setCuentas(cuentas);
    };
    fetchData();
  }, []);

  const handleRegistrar = async () => {
    if (!ventaSeleccionada?.saleId) {
      showError("Debes seleccionar un documento válido.");
      return;
    }

    const cuentaObj = cuentas.find((c) => c.accountName === cuentaSeleccionada);
    if (!cuentaObj) {
      showError("Debes seleccionar una cuenta válida.");
      return;
    }

    if (tipoLiquidacion === "PARCIAL" && (!montoAbono || parseFloat(montoAbono) <= 0)) {
      showError("Debe ingresar un monto válido para abonar.");
      return;
    }

    try {
      const result = await registrarLiquidacionVenta({
        documentNumber: ventaSeleccionada.documentNumber,
        cuentaNombre: cuentaSeleccionada,
        metodoPago,
        referencia,
        descripcion,
        ventas: documentos,
        cuentas,
        tipoLiquidacion,
        montoAbono,
      });

      if (result.success) {
        showSuccess("Liquidación registrada con éxito.");
        onClose();
      } else {
        showError("Error al registrar: " + result.message);
      }
    } catch (error) {
      console.error("Error al registrar liquidación:", error);
      showError("Ocurrió un error: " + error.message);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        <h3 className={styles.title}>Selecciona el tipo de liquidación</h3>

        <div className={styles.tipo}>
          <label>
            <input
              type="radio"
              name="tipo"
              value="VENTA"
              checked={tipoLiquidacion === "VENTA"}
              onChange={() => setTipoLiquidacion("VENTA")}
            />
            Liquidar venta
          </label>
          <label>
            <input
              type="radio"
              name="tipo"
              value="PARCIAL"
              checked={tipoLiquidacion === "PARCIAL"}
              onChange={() => setTipoLiquidacion("PARCIAL")}
            />
            Liquidación Parcial
          </label>
        </div>

        <div className={styles.formGrid}>
          <AutocompleteSelect
            label="N° De documento"
            options={documentos.map((v) => v.documentNumber)}
            placeholder="Buscar documento"
            onSelect={(value) => {
              const venta = documentos.find((v) => v.documentNumber === value);
              setVentaSeleccionada(venta);
            }}
          />

          <div>
            <label className={styles.label}>Método de pago</label>
            <select
              className={styles.input}
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option>Transacción</option>
              <option>Tarjeta</option>
              <option>Remesa</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.input}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label}>Referencia</label>
            <input
              type="text"
              className={styles.input}
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          <AutocompleteSelect
            label="Cuenta"
            options={cuentas.map((c) => c.accountName)}
            placeholder="Buscar cuenta bancaria"
            onSelect={(value) => setCuentaSeleccionada(value)}
          />

          {tipoLiquidacion === "PARCIAL" && (
            <div>
              <label className={styles.label}>Monto del abono</label>
              <input
                type="number"
                placeholder="Ej: 100.00"
                className={styles.input}
                inputMode="decimal"
                onWheel={(e) => e.target.blur()}
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancel}>Cancelar</button>
          <button onClick={handleRegistrar} className={styles.register}>
            {tipoLiquidacion === "PARCIAL" ? "Registrar abono" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterReceivableLiquidacion;
