import React, { useState, useEffect } from "react";
import AutocompleteSelect from "./AutocompleteSelect";
import styles from "../../styles/accountsreceivable/RegisterReceivableLiquidacion.module.css";
import { getBankAcount } from "../../services/accountsreceivable/bankService";
import { registrarLiquidacionVenta } from "../../services/accountsreceivable/liquidacionVentaServices";
import { Notifier } from '../../utils/alertUtils';

const RegisterReceivableLiquidacion = ({ onClose, selectedSale }) => {
  const [tipoLiquidacion, setTipoLiquidacion] = useState("VENTA");
  const [cuentas, setCuentas] = useState([]);
  const [documento, setDocumento] = useState("");
  const [saleId, setSaleId] = useState(null);
  const [montoTotalVenta, setMontoTotalVenta] = useState(selectedSale ? parseFloat(selectedSale.montoTotal.replace('$', '')) : 0);
   const [saldoActualVenta, setSaldoActualVenta] = useState(selectedSale ? parseFloat(selectedSale.saldo.replace('$', '')) : 0);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Transacción");

  useEffect(() => {
    // Si se pasa una venta seleccionada, actualiza los estados
    if (selectedSale) {
      setVentaSeleccionada(selectedSale);
      
      // El saleId del backend lo obtenemos del 'id' de la fila de la tabla
      setSaleId(selectedSale.saleId); 
      // Convertir el monto total de string a número para los cálculos
      setMontoTotalVenta(parseFloat(selectedSale.montoTotal.replace("$", "")));
    }

    const fetchCuentas = async () => {
      try {
        const data = await getBankAcount();
        setCuentas(data);
        if (data.length > 0) {
          setCuentaSeleccionada(data[0].accountName); // Seleccionar la primera cuenta por defecto
        }
      } catch (error) {
        Notifier.error("Error al cargar las cuentas bancarias.");
        console.error("Error al cargar las cuentas bancarias:", error);
      }
    };
    fetchCuentas();
  }, [selectedSale]);

  // Maneja el cambio de radio button y actualiza el valor del monto si se cambia a "VENTA"
  const handleTipoLiquidacionChange = (e) => {
    const newTipo = e.target.value;
    setTipoLiquidacion(newTipo);

    // Si el usuario selecciona "Liquidar venta" (total),
    // actualizamos el monto del abono con el saldo actual.
    if (newTipo === "VENTA") {
      setMontoAbono(saldoActualVenta.toFixed(2));
    } else {
      // Si cambia a "Parcial", limpiamos el monto del abono
      // para que el usuario pueda ingresar uno nuevo.
      setMontoAbono("");
    }
  };

const handleRegistrar = async () => {
 if (!ventaSeleccionada?.saleId) {
      Notifier.error("No se ha seleccionado una venta para liquidar.");
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
    
  } else {
    montoFinalAPagar = saldoActualVenta;
  }
    try {
      const result = await registrarLiquidacionVenta({
        saleId: ventaSeleccionada.saleId,
        accountId: cuentaObj.id, //  Pasamos el ID de la cuenta directamente
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
              value="VENTA"
              checked={tipoLiquidacion === "VENTA"}
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
              onChange={ handleTipoLiquidacionChange}
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
      // Usamos el valor de la venta seleccionada
      value={ventaSeleccionada?.documento || "N/A"}
      // Deshabilitamos el input para que no se pueda modificar
      disabled
    />
  </div>
    <div>
      <label className={styles.label}>Saldo Actual</label>
        <input
            type="text"
            className={styles.input}
            value={`$${saldoActualVenta.toFixed(2)}`}
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
                 disabled={tipoLiquidacion === "VENTA"}
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
