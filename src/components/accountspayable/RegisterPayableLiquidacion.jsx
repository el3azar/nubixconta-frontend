import React, { useState, useEffect } from "react";
import AutocompleteSelect from '../accountsreceivable/AutocompleteSelect';
import styles from "../../styles/accountsreceivable/RegisterReceivableLiquidacion.module.css";
import { getBankAcount } from "../../services/accountsreceivable/bankService";
import { Notifier } from '../../utils/alertUtils';
import { settlementPayableService, getPurchaseIdByDocumentNumber } from "../../services/accountspayable/settlementPayableService"; // Importa la nueva función

  const RegisterPayableLiquidacion = ({ onClose, selectedPurchase }) => {
  const [tipoLiquidacion, setTipoLiquidacion] = useState("COMPRA");
  const [cuentas, setCuentas] = useState([]);
  const [documento, setDocumento] = useState("");
  const [idPurchase, setPurchaseId] = useState(null); // Estado para almacenar el idPurchase del backend
  const [montoTotalCompra, setMontoTotalCompra] = useState(selectedPurchase ? parseFloat(selectedPurchase.montoTotal.replace('$', '')) : 0);
  const [saldoActualCompra, setSaldoActualCompra] = useState(selectedPurchase ? parseFloat(selectedPurchase.saldo.replace('$', '')) : 0);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Transacción");

  useEffect(() => {
    console.log("selectedPurchase en RegisterPayableLiquidacion:", selectedPurchase);
    if (selectedPurchase) {
      setCompraSeleccionada(selectedPurchase);
      setMontoTotalCompra(parseFloat(selectedPurchase.montoTotal.replace("$", "")));
      setSaldoActualCompra(parseFloat(selectedPurchase.saldo.replace("$", ""))); // Asegúrate de actualizar el saldo actual
      setDocumento(selectedPurchase.documento); // Asegúrate de tener el número de documento

      // **** NUEVA LÓGICA: Obtener idPurchase del backend usando el número de documento ****
      const fetchPurchaseId = async () => {
        try {
          const fetchedId = await getPurchaseIdByDocumentNumber(selectedPurchase.documento);
          setPurchaseId(fetchedId); // Almacenar el ID de la compra del backend
          console.log("ID de compra obtenido del backend:", fetchedId);
        } catch (error) {
          Notifier.error("Error al obtener el ID de la compra por documento.");
          console.error("Error al obtener ID de compra:", error);
          setPurchaseId(null); // Asegúrate de resetear si hay error
        }
      };
      fetchPurchaseId();
    }

    const fetchCuentas = async () => {
      try {
        const data = await getBankAcount();
        setCuentas(data);
        if (data.length > 0) {
          setCuentaSeleccionada(data[0].accountName);
        }
      } catch (error) {
        Notifier.error("Error al cargar las cuentas bancarias.");
        console.error("Error al cargar las cuentas bancarias:", error);
      }
    };
    fetchCuentas();
  }, [selectedPurchase]); // Dependencia clave para que se ejecute cuando cambie selectedPurchase

  const handleTipoLiquidacionChange = (e) => {
    const newTipo = e.target.value;
    setTipoLiquidacion(newTipo);

    if (newTipo === "COMPRA") {
      setMontoAbono(saldoActualCompra.toFixed(2));
    } else {
      setMontoAbono("");
    }
  };

  const handleRegistrar = async () => {
    if (!idPurchase) { // Usamos el idPurchase que obtuvimos del backend
      Notifier.error("No se pudo obtener el ID de la compra para liquidar.");
      return;
    }

    const cuentaObj = cuentas.find((c) => c.accountName === cuentaSeleccionada);
    if (!cuentaObj) {
      Notifier.error("Debes seleccionar una cuenta válida.");
      return;
    }

    let montoFinalAPagar;

    if (tipoLiquidacion === "PARCIAL") {
      montoFinalAPagar = parseFloat(montoAbono);
      if (isNaN(montoFinalAPagar) || montoFinalAPagar <= 0) {
        Notifier.error("El monto a abonar debe ser un número positivo y válido.");
        return;
      }
       if (montoFinalAPagar > saldoActualCompra) {
        Notifier.error("El monto a abonar no puede ser mayor al saldo actual.");
        return;
      }
    } else {
      montoFinalAPagar = saldoActualCompra;
    }

    try {
      const result = await settlementPayableService({
        idPurchase: idPurchase, // Usamos el idPurchase obtenido del backend
        accountId: cuentaObj.id,
        cuentaNombre: cuentaSeleccionada,
        metodoPago,
        referencia,
        descripcion,
        cuentas,
        montoAPagar: montoFinalAPagar,
      });

      if (result.success) {
        Notifier.success("Liquidación registrada con éxito.");
        onClose();
      } else {
        Notifier.error("Error al registrar: " + result.message);
      }
    } catch (error) {
      console.error("Error al registrar liquidación:", error);
      Notifier.error("Ocurrió un error: " + error.message);
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
              value="COMPRA"
              checked={tipoLiquidacion === "COMPRA"}
              onChange={handleTipoLiquidacionChange}
            />
            Liquidación total
          </label>
          <label>
            <input
              type="radio"
              name="tipo"
              value="PARCIAL"
              checked={tipoLiquidacion === "PARCIAL"}
              onChange={handleTipoLiquidacionChange}
            />
            Liquidación Parcial
          </label>
        </div>

        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>N° De documento</label>
            <input
              type="text"
              className={styles.input}
              value={documento || "N/A"} // Usa el estado 'documento'
              disabled
            />
          </div>
          <div>
            <label className={styles.label}>Saldo Actual</label>
            <input
              type="text"
              className={styles.input}
              value={`$${saldoActualCompra.toFixed(2)}`}
              disabled
            />
          </div>
          <div>
            <label className={styles.label}>Método de pago</label>
            <select
              className={styles.input}
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option>Transferencia</option>
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
            value={cuentaSeleccionada}
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
                disabled={tipoLiquidacion === "COMPRA"}
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

export default RegisterPayableLiquidacion;